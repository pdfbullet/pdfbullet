from rembg import new_session, remove
from PIL import Image
import sys

def main():
    if len(sys.argv) < 3:
        print("Usage: python remove_bg.py <input_path> <output_path>")
        sys.exit(1)
        
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    
    try:
        input_image = Image.open(input_path)
        
        # Load the state-of-the-art BiRefNet general use model
        print("Initializing ultra-high-quality BiRefNet model...")
        session = new_session("birefnet-general")
        
        # Remove background with alpha matting for ultra-clean edges
        print("Processing background removal...")
        output_image = remove(
            input_image, 
            session=session,
            alpha_matting=True,
            alpha_matting_foreground_threshold=240,
            alpha_matting_background_threshold=10,
            alpha_matting_erode_size=10
        )
        
        output_image.save(output_path, "PNG")
        print("SUCCESS")
    except Exception as e:
        print(f"ERROR: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
