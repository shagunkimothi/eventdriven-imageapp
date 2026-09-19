import io
from PIL import Image

def optimize_image(image_bytes, output_format='jpeg', quality=85, max_dimension=800):
    output_format = output_format.lower()
    if output_format not in ('webp', 'jpeg', 'png'):
        raise ValueError('output_format must be webp, jpeg, or png')
    if not 1 <= int(quality) <= 100:
        raise ValueError('quality must be an integer from 1 to 100')
    if int(max_dimension) <= 0:
        raise ValueError('max_dimension must be positive')

    quality = int(quality)
    max_dimension = int(max_dimension)
    image = Image.open(io.BytesIO(image_bytes))
    original_dimensions = image.size
    image.thumbnail((max_dimension, max_dimension))

    if output_format == 'jpeg':
        if image.mode in ('RGBA', 'P', 'LA'):
            image = image.convert('RGB')
        actual_format = 'JPEG'
        content_type = 'image/jpeg'
        file_extension = 'jpg'
    elif output_format == 'png':
        buffer = io.BytesIO()
        image.save(buffer, format='PNG', optimize=True)
        return {
            'optimized_bytes': buffer.getvalue(),
            'original_dimensions': original_dimensions,
            'new_dimensions': image.size,
            'actual_format': 'PNG',
            'content_type': 'image/png',
            'file_extension': 'png',
        }

    else:
        buffer = io.BytesIO()
        image.save(buffer, format='WEBP', quality=quality, method=6)
        return {
            'optimized_bytes': buffer.getvalue(),
            'original_dimensions': original_dimensions,
            'new_dimensions': image.size,
            'actual_format': 'WebP',
            'content_type': 'image/webp',
            'file_extension': 'webp',
        }

    buffer = io.BytesIO()
    image.save(buffer, format=actual_format, quality=quality, optimize=True)
    return {
        'optimized_bytes': buffer.getvalue(),
        'original_dimensions': original_dimensions,
        'new_dimensions': image.size,
        'actual_format': actual_format,
        'content_type': content_type,
        'file_extension': file_extension,
    }