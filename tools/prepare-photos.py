#!/usr/bin/env python3
"""Готовит фото работ для сайта.

Проходит по assets/work-examples/<папка>/ и для каждого фото:
  * уменьшает оригинал до 2000 px по длинной стороне (если он больше), JPEG ~85%;
  * кладёт превью для сетки в <папка>/thumbs/<имя>.webp (900 px по ширине).
Файлы <имя>-large.* (большие версии для слайдшоу на первом экране) не трогает.

Повторный запуск безопасен: готовые превью и уже уменьшенные фото пропускаются.
Нужен Pillow:  pip install pillow
Запуск из корня сайта:  python3 tools/prepare-photos.py
"""
from pathlib import Path
import sys

try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit('Нужен Pillow: pip install pillow')

ROOT = Path(__file__).resolve().parent.parent / 'assets' / 'work-examples'
MAX_SIDE = 2000
THUMB_W = 900
EXTS = {'.jpg', '.jpeg', '.png', '.webp'}


def main():
    if not ROOT.is_dir():
        sys.exit(f'Нет папки {ROOT}')
    done = skipped = 0
    for src in sorted(ROOT.rglob('*')):
        if src.suffix.lower() not in EXTS or 'thumbs' in src.parts or not src.is_file() or src.stem.endswith('-large'):
            continue
        with Image.open(src) as im:
            im = ImageOps.exif_transpose(im)  # фото с телефона: учитываем поворот
            if max(im.size) > MAX_SIDE:
                im.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)
                if src.suffix.lower() in {'.jpg', '.jpeg'}:
                    im.convert('RGB').save(src, quality=85, optimize=True, progressive=True)
                else:
                    im.save(src)
                print(f'уменьшено  {src.relative_to(ROOT)}  -> {im.size[0]}x{im.size[1]}')

            thumb = src.parent / 'thumbs' / (src.stem + '.webp')
            if thumb.exists() and thumb.stat().st_mtime >= src.stat().st_mtime:
                skipped += 1
                continue
            thumb.parent.mkdir(exist_ok=True)
            t = im.convert('RGB')
            if t.width > THUMB_W:
                t = t.resize((THUMB_W, round(t.height * THUMB_W / t.width)), Image.LANCZOS)
            t.save(thumb, 'WEBP', quality=80, method=6)
            done += 1
            print(f'превью     {thumb.relative_to(ROOT)}')
    print(f'Готово: новых превью {done}, без изменений {skipped}.')


if __name__ == '__main__':
    main()
