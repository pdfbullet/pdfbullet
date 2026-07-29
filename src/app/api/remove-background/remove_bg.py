import json
from rembg import new_session, remove
from PIL import Image, ImageFilter
import sys

def report_progress(percentage, status):
    print(json.dumps({"progress": percentage, "status": status}), flush=True)

def main():
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: python remove_bg.py <input_path> <output_path>"}), flush=True)
        sys.exit(1)
        
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    
    try:
        report_progress(10, "Preparing image...")
        input_image = Image.open(input_path).convert("RGBA")
        
        # Load the state-of-the-art BiRefNet general use model for maximum quality
        report_progress(40, "Loading high-quality AI model...")
        session = new_session("birefnet-general")
        
        # Remove background using post_process_mask for fast, clean edges instead of slow alpha_matting
        report_progress(70, "AI generating ultra-HD background mask...")
        output_image = remove(
            input_image, 
            session=session,
            post_process_mask=True
        )
        
        report_progress(90, "Refining edges and saving...")
        output_image.save(output_path, "PNG")
        report_progress(100, "Complete!")
        
    except Exception as e:
        print(json.dumps({"error": str(e)}), flush=True)
        sys.exit(1)

if __name__ == "__main__":
    main()
