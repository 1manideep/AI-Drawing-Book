from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from processing import process_image_bundle
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv
from openai import OpenAI
import requests

load_dotenv()

app = FastAPI(title="ScribbleAI Vision Pipe")

# Allow all CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@app.get("/")
async def root():
    return {"status": "online", "service": "ScribbleAI Vision Pipe"}

@app.post("/process-image")
async def process_image(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        result = process_image_bundle(contents)
        return result
    except Exception as e:
        return {"error": str(e)}

@app.post("/generate-image")
async def generate_image_endpoint(prompt: str = Form(...)):
    api_key = os.getenv("OPENAI_API_KEY")
    print(f"DEBUG: Loaded API Key: {api_key[:5]}... by looking in {os.getcwd()}") # Debugging
    if not api_key or "your_key_here" in api_key:
         print("DEBUG: API Key check failed")
         raise HTTPException(status_code=500, detail="OpenAI API Key not configured on server. Check .env file.")

    try:
        # Generate minimalist vector line-art style image using user's template
        full_prompt = f"Minimalist vector line art suitable for a children's coloring page of {prompt}. Use thick, uniform, continuous contour lines. The entire image should be composed only of closed black line loops on a white canvas. Zero shading, zero gradients, and absolutely no solid filled areas. Focus on the main subject with little to no background."
        
        response = client.images.generate(
            model="dall-e-3",
            prompt=full_prompt,
            n=1,
            size="1024x1024"
        )
        
        # Check if response has data
        if not response.data:
            raise HTTPException(status_code=500, detail="No image data returned from OpenAI")
            
        image_url = response.data[0].url
        
        # Download image
        img_response = requests.get(image_url)
        if img_response.status_code != 200:
             raise HTTPException(status_code=500, detail="Failed to download generated image.")
             
        image_bytes = img_response.content
        
        # DEBUG: Save raw OpenAI image
        import time
        import base64
        timestamp = int(time.time())
        raw_filename = f"debug_openai_{timestamp}.png"
        with open(raw_filename, "wb") as f:
            f.write(image_bytes)
        print(f"DEBUG: Saved raw OpenAI image to {raw_filename}")
        
        # Process through our existing pipe
        result = process_image_bundle(image_bytes)
        
        # DEBUG: Save final processed image
        if "image" in result:
            header, encoded = result["image"].split(",", 1)
            final_bytes = base64.b64decode(encoded)
            processed_filename = f"debug_final_{timestamp}.png"
            with open(processed_filename, "wb") as f:
                f.write(final_bytes)
            print(f"DEBUG: Saved final processed image to {processed_filename}")

        return result # process_image_bundle returns a dict, FastAPI converts to JSON automatically
        
    except Exception as e:
        import logging
        logging.error(f"Error generating image: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"OpenAI Error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
