#!/usr/bin/env python3
"""
Convert blue colors in the logo to white using PIL/Pillow
LUNA - Logo color converter for Tracepoint
"""

from PIL import Image
import numpy as np

def convert_blue_to_white(input_path, output_path):
    """Convert blue colors to white while preserving transparency"""

    # Open the image
    img = Image.open(input_path)

    # Convert to RGBA if not already
    if img.mode != 'RGBA':
        img = img.convert('RGBA')

    # Convert to numpy array for easier manipulation
    data = np.array(img)

    # Extract RGBA channels
    red = data[:, :, 0]
    green = data[:, :, 1]
    blue = data[:, :, 2]
    alpha = data[:, :, 3]

    # Define blue color range (adjust threshold as needed)
    # Looking for pixels where blue is dominant
    blue_mask = (blue > red + 20) & (blue > green + 20) & (alpha > 0)

    # Also catch lighter blues and blue-ish colors
    light_blue_mask = (blue > 100) & (red < 180) & (green < 180) & (alpha > 0)

    # Combine masks
    final_mask = blue_mask | light_blue_mask

    # Replace blue pixels with white (255, 255, 255) while preserving alpha
    data[final_mask, 0] = 255  # Red
    data[final_mask, 1] = 255  # Green
    data[final_mask, 2] = 255  # Blue
    # Alpha channel stays the same

    # Create new image from modified data
    result = Image.fromarray(data, 'RGBA')

    # Save the result
    result.save(output_path, 'PNG')
    print(f"✅ Converted logo saved to: {output_path}")
    print(f"📊 Image size: {result.size}")
    print(f"🎨 Blue pixels converted to white")

    return result

if __name__ == '__main__':
    input_file = '/home/lytle/twenty-dev/Misc_docs/zzxz-no-bg.png'
    output_file = '/home/lytle/twenty-dev/packages/twenty-front/public/images/logos/luna-logo-white.png'

    try:
        convert_blue_to_white(input_file, output_file)
        print("\n🌙 LUNA conversion complete!")
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
