#!/usr/bin/env python3
"""
Replace GitHub-style emoji shortcodes (e.g. :one:, :warning:) with actual Unicode emojis
in all Markdown post files.
"""

import os
import re
import glob

# Map of emoji shortcodes to Unicode emojis
EMOJI_MAP = {
    # Numbers (English shortcodes)
    ":zero:": "0️⃣",
    ":one:": "1️⃣",
    ":two:": "2️⃣",
    ":three:": "3️⃣",
    ":four:": "4️⃣",
    ":five:": "5️⃣",
    ":six:": "6️⃣",
    ":seven:": "7️⃣",
    ":eight:": "8️⃣",
    ":nine:": "9️⃣",
    ":keycap_ten:": "🔟",
    # Numbers (French shortcodes from translation)
    ":zéro:": "0️⃣",
    ":un:": "1️⃣",
    ":deux:": "2️⃣",
    ":trois:": "3️⃣",
    ":quatre:": "4️⃣",
    ":cinq:": "5️⃣",
    ":six_fr:": "6️⃣",
    ":sept:": "7️⃣",
    ":huit:": "8️⃣",
    ":neuf:": "9️⃣",
    # Symbols / icons used in posts
    ":warning:": "⚠️",
    ":question:": "❓",
    ":exclamation:": "❗",
    ":small_blue_diamond:": "🔹",
    ":small_orange_diamond:": "🔸",
    ":arrow_heading_down:": "⤵️",
    ":arrow_right:": "➡️",
    ":arrow_left:": "⬅️",
    ":arrow_up:": "⬆️",
    ":arrow_down:": "⬇️",
    ":white_check_mark:": "✅",
    ":x:": "❌",
    ":heavy_check_mark:": "✔️",
    ":bulb:": "💡",
    ":fire:": "🔥",
    ":star:": "⭐",
    ":rocket:": "🚀",
    ":lock:": "🔒",
    ":key:": "🔑",
    ":computer:": "💻",
    ":globe_with_meridians:": "🌐",
    ":shield:": "🛡️",
    ":hammer:": "🔨",
    ":wrench:": "🔧",
    ":gear:": "⚙️",
    ":memo:": "📝",
    ":book:": "📖",
    ":books:": "📚",
    ":pencil:": "✏️",
    ":pencil2:": "✏️",
    ":clipboard:": "📋",
    ":pushpin:": "📌",
    ":link:": "🔗",
    ":information_source:": "ℹ️",
    ":tada:": "🎉",
    ":boom:": "💥",
    ":zap:": "⚡",
    ":mag:": "🔍",
    ":eyes:": "👀",
    ":point_right:": "👉",
    ":point_left:": "👈",
    ":point_up:": "👆",
    ":point_down:": "👇",
    ":ok_hand:": "👌",
    ":thumbsup:": "👍",
    ":thumbsdown:": "👎",
    ":100:": "💯",
    ":clap:": "👏",
    ":wave:": "👋",
    ":trophy:": "🏆",
    ":medal_sports:": "🏅",
    ":checkered_flag:": "🏁",
    # Colors / shapes
    ":red_circle:": "🔴",
    ":orange_circle:": "🟠",
    ":yellow_circle:": "🟡",
    ":green_circle:": "🟢",
    ":blue_circle:": "🔵",
    ":purple_circle:": "🟣",
    ":white_circle:": "⚪",
    ":black_circle:": "⚫",
    # Hearts
    ":heart:": "❤️",
    ":green_heart:": "💚",
    ":blue_heart:": "💙",
    ":yellow_heart:": "💛",
    ":purple_heart:": "💜",
    ":orange_heart:": "🧡",
    ":black_heart:": "🖤",
    # Misc that appeared in posts
    ":dd:": "🔹",   # Unknown shortcode - use diamond
    ":bb:": "🔷",   # Unknown shortcode - use diamond
}


def replace_emojis_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    # Replace known shortcodes
    for shortcode, emoji in EMOJI_MAP.items():
        content = content.replace(shortcode, emoji)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  Updated: {os.path.basename(filepath)}")
        return True
    else:
        print(f"  No changes: {os.path.basename(filepath)}")
        return False


def main():
    base = os.path.dirname(os.path.abspath(__file__))
    posts_dirs = [
        os.path.join(base, '_posts'),
        os.path.join(base, '_posts_fr'),
    ]

    total_updated = 0
    for posts_dir in posts_dirs:
        if not os.path.isdir(posts_dir):
            print(f"Directory not found: {posts_dir}")
            continue
        files = sorted(glob.glob(os.path.join(posts_dir, '*.md')))
        print(f"\nProcessing {len(files)} files in {posts_dir}:")
        for f in files:
            if replace_emojis_in_file(f):
                total_updated += 1

    print(f"\nDone! {total_updated} files updated.")


if __name__ == '__main__':
    main()
