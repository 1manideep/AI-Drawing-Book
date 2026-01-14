import cv2
import numpy as np
import base64
# Ensure opencv-contrib is installed for ximgproc
# pip install opencv-contrib-python-headless

def process_image_bundle(image_bytes: bytes):
    """
    Orchestrates the full pipeline:
    1. Clean Logic (Otsu + Morphology)
    2. Line Art Generation (Canny)
    3. Dot Extraction (Contours + RDP)
    
    Returns:
       dict: { "image": base64_string, "dots": [ {x, y, order} ] }
    """
    # 1. Decode
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Could not decode image")
        
    # 1.5. Resize/Pad to fit 800x600 (Frontend Canvas Size)
    # This ensures no distortion ("squashed outlines") and perfect dot alignment.
    target_w, target_h = 800, 600
    h, w = img.shape[:2]
    
    # Calculate scale to fit (contain)
    scale = min(target_w / w, target_h / h)
    new_w = int(w * scale)
    new_h = int(h * scale)
    
    resized = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_AREA)
    
    # Create white canvas
    canvas = np.full((target_h, target_w, 3), 255, dtype=np.uint8)
    
    # Center paste
    x_offset = (target_w - new_w) // 2
    y_offset = (target_h - new_h) // 2
    canvas[y_offset:y_offset+new_h, x_offset:x_offset+new_w] = resized
    
    img = canvas # Use this normalized image for the rest of the pipe

    # 2. Pre-processing & Binarization
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    
    # Otsu's thresholding to get the "Shape" vs "Background"
    _, binary = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    
    # Morphological Closing to fill gaps/noise in the shape
    kernel = np.ones((5, 5), np.uint8) # Increased kernel slightly for better closing
    closing = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel, iterations=2)
    
    # 3. Skeletonization (The "Centerline" Logic)
    # Instead of Canny (which gives double edges), we want the center of the stroke.
    # We use morphological thinning.
    
    # Ensure binary is correct (Text/Lines should be White, Background Black for thinning)
    # Our 'closing' is: Lines are Black (0), Background White (255) (from Otsu Inv) -> Wait.
    # Otsu Inv: Max val (white) for foreground (lines).
    # Let's check:
    # invalid? cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    # If original was white paper / black ink.
    # THRESH_BINARY_INV -> White pixels = Dark regions (Ink). Black pixels = Bright regions (Paper).
    # So 'binary' has White Ink.
    
    # Thinning requires White Foreground.
    skeleton = cv2.ximgproc.thinning(closing, thinningType=cv2.ximgproc.THINNING_GUOHALL)
    
    # 4. Dot Extraction from Skeleton
    # Now find contours on the skeleton. 
    # Since it's 1px wide, the contour follows the stroke exactly once (mostly).
    contours, _ = cv2.findContours(skeleton, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    
    dots = []
    if contours:
        # Filter for the largest "stroke"
        contours = sorted(contours, key=cv2.contourArea, reverse=True)
        # Take top 3 contours if multiple segments (e.g. detached parts)?
        # For simplicity, let's take the largest one for the main loop.
        main_contour = contours[0]
        
        # Sort points in the contour? 
        # findContours returns them ordered along the boundary.
        # For a skeleton, the "boundary" is basically the line itself (doubled back).
        # We need to subsample it.
        
        # Simplification
        epsilon = 0.005 * cv2.arcLength(main_contour, True)
        approx = cv2.approxPolyDP(main_contour, epsilon, True)
        
        raw_points = [pt[0] for pt in approx]
        interpolated_dots = []
        
        # Sampling logic
        MIN_DIST = 40 # Increased spacing for cleaner look
        
        # Start with the first point
        if len(raw_points) > 0:
            interpolated_dots.append(raw_points[0])
            last_added = raw_points[0]
            
            # Walk through the simplified path
            for i in range(1, len(raw_points)):
                p2 = raw_points[i]
                dist = np.linalg.norm(last_added - p2)
                
                if dist >= MIN_DIST:
                    # If nicely spaced, just add
                    interpolated_dots.append(p2)
                    last_added = p2
                else:
                    # Too close, skip to avoid clutter
                    continue
                    
        # Assign order
        for i, pt in enumerate(interpolated_dots):
             dots.append({
                 "x": int(pt[0]),
                 "y": int(pt[1]),
                 "order": i + 1
             })

    # 5. Visual Asset
    # The user wants the crisp, original OpenAI generation, not the binary mask.
    # Since the prompt ensures high-contrast B&W, we can just return the original grayscale image.
    # We might want to just threshold it lightly to ensure pure white background if needed, 
    # but DALL-E 3 is usually good. Let's return the original `gray` or `img`.
    
    # Let's use the grayscale version to ensure file size is optimized and it fits the "coloring book" vibe.
    # We DO NOT invert it if the source is White Paper / Black Lines.
    # Our processing logic (Otsu Inv) assumed White Ink.
    # But for display, we want Black Ink on White Paper.
    
    # If the original `img` is Black Lines on White Paper, `gray` is perfect.
    visual_art = gray
    
    # 6. Palette Extraction (Dominant Colors)
    # We use the ORIGINAL image (img) for this, not the binary one.
    # Resize for speed
    small_img = cv2.resize(img, (150, 150))
    pixels = np.float32(small_img.reshape(-1, 3))
    
    # K-Means
    n_colors = 5
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 10, 1.0)
    _, labels, centers = cv2.kmeans(pixels, n_colors, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
    
    palette = []
    for center in centers:
        # OpenCv is BGR, we need RGB/Hex
        b, g, r = center
        hex_color = "#{:02x}{:02x}{:02x}".format(int(r), int(g), int(b))
        palette.append(hex_color)
    
    # Encode Visual Art
    _, buffer = cv2.imencode('.png', visual_art)
    img_base64 = base64.b64encode(buffer).decode('utf-8')
            
    return {
        "image": f"data:image/png;base64,{img_base64}",
        "dots": dots,
        "palette": palette
    }
