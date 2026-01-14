import cv2
import numpy as np
import base64

def zhang_suen_thinning(img):
    """
    Implements Zhang-Suen thinning algorithm using standard OpenCV functions.
    Input: Binary image (0 and 1/255) where foreground is white.
    """
    # Create a copy
    img1 = img.copy()
    
    # Kernel for hit-or-miss transform? No, manual implementation is often faster than 
    # repeated python loops, but pure python loops on pixels are slow.
    # Let's use cv2.erode for the iterations.
    
    # Actually, standard thin() from scratch in Python/Numpy is slightly complex for one function.
    # An easier approximation for "centerline" that works efficiently with standard cv2:
    # skeleton = cv2.ximgproc.thinning... OH WAIT, we don't have ximgproc.
    
    # Alternative: Distance Transform + Ridge Detection / Skeletonize
    # Or just use the standard topological skeletonization loop:
    
    # Skeletonize using morphological erosion and subtraction
    # 1. Get the skeleton
    size = np.size(img1)
    skel = np.zeros(img1.shape, np.uint8)
    
    element = cv2.getStructuringElement(cv2.MORPH_CROSS, (3,3))
    
    while True:
        open_img = cv2.morphologyEx(img1, cv2.MORPH_OPEN, element)
        temp = cv2.subtract(img1, open_img)
        eroded = cv2.erode(img1, element)
        skel = cv2.bitwise_or(skel, temp)
        img1 = eroded.copy()
        if cv2.countNonZero(img1) == 0:
            break
            
    return skel

def process_image_bundle(image_bytes):
    try:
        # Robust buffer conversion
        try:
            nparr = np.frombuffer(image_bytes, np.uint8)
        except Exception:
            # Fallback for JsProxy or other types
            nparr = np.array(image_bytes, dtype=np.uint8)

        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            return {"error": "Failed to decode image bytes"}
        
        # Resize/Pad logic (same as before)
        target_w, target_h = 800, 600
        h, w = img.shape[:2]
        scale = min(target_w / w, target_h / h)
        new_w = int(w * scale)
        new_h = int(h * scale)
        resized = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_AREA)
        
        # No padding - use resized image directly
        img = resized
        
        # Pre-processing
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        blur = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # Otsu
        _, binary = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
        
        # Closing
        kernel = np.ones((5, 5), np.uint8)
        closing = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel, iterations=2)
        
        # Thinning (Custom Implementation)
        skeleton = zhang_suen_thinning(closing)
        
        # Dot Extraction
        contours, _ = cv2.findContours(skeleton, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
        
        dots = []
        if contours:
            contours = sorted(contours, key=cv2.contourArea, reverse=True)
            main_contour = contours[0]
            
            epsilon = 0.005 * cv2.arcLength(main_contour, True)
            approx = cv2.approxPolyDP(main_contour, epsilon, True)
            
            raw_points = [pt[0] for pt in approx]
            interpolated_dots = []
            MIN_DIST = 40
            
            if len(raw_points) > 0:
                interpolated_dots.append(raw_points[0])
                last_added = raw_points[0]
                
                for i in range(1, len(raw_points)):
                    p2 = raw_points[i]
                    dist = np.linalg.norm(last_added - p2)
                    if dist >= MIN_DIST:
                        interpolated_dots.append(p2)
                        last_added = p2
                        
            for i, pt in enumerate(interpolated_dots):
                 dots.append({
                     "x": int(pt[0]),
                     "y": int(pt[1]),
                     "order": i + 1
                 })

        # Visual Asset (Strict Black & White)
        # binary is White lines on Black bg (THRESH_BINARY_INV)
        # Dilate to thicken the lines
        line_kernel = np.ones((2,2), np.uint8) # 2x2 dilation to thicken slightly
        thick_binary = cv2.dilate(binary, line_kernel, iterations=1)
        
        # We want Black lines on White bg -> bitwise_not
        visual_art = cv2.bitwise_not(thick_binary)
        
        # Palette
        small_img = cv2.resize(img, (150, 150))
        pixels = np.float32(small_img.reshape(-1, 3))
        n_colors = 5
        criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 10, 1.0)
        _, labels, centers = cv2.kmeans(pixels, n_colors, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
        
        palette = []
        for center in centers:
            b, g, r = center
            hex_color = "#{:02x}{:02x}{:02x}".format(int(r), int(g), int(b))
            palette.append(hex_color)
        
        # Encode
        _, buffer = cv2.imencode('.png', visual_art)
        img_base64 = base64.b64encode(buffer).decode('utf-8')
        
        # Return as dict (Pyodide handles dict conversion)
        return {
            "image": f"data:image/png;base64,{img_base64}",
            "dots": dots,
            "palette": palette,
            "width": new_w,
            "height": new_h
        }
    except Exception as e:
        import traceback
        return {"error": f"{str(e)}\n{traceback.format_exc()}"}


