"""Berechnet fuer jedes Titelbild einen individuellen CSS-background-position-
Wert per Gesichtserkennung (OpenCV YuNet-DNN, ONNX), statt sitesweit eine
einzige Position (center/top) zu raten. Bei mehreren Gesichtern wird die
umschliessende Box aller Gesichter verwendet, bei keinem erkannten Gesicht
faellt der Wert auf eine obere Position zurueck (die meisten Titelbilder sind
Personen-Fotos mit dem Kopf im oberen Drittel).

Modell: face_detection_yunet_2023mar.onnx aus opencv_zoo (MIT-lizenziert),
nach migration/models/ heruntergeladen, NICHT Teil des Node-Bundles/Deploys
(nur zur einmaligen Offline-Berechnung beim Bild-Import gebraucht).

Schreibt "featuredImagePosition": "<x>% <y>%" in jeden Post mit featuredImage.
"""
import json
import os
import cv2

MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "face_detection_yunet_2023mar.onnx")
FALLBACK_POSITION = "50% 22%"


def detect_position(path: str, detector) -> str:
    img = cv2.imread(path)
    if img is None:
        return FALLBACK_POSITION
    h, w = img.shape[:2]
    detector.setInputSize((w, h))
    _, faces = detector.detect(img)
    if faces is None or len(faces) == 0:
        return FALLBACK_POSITION

    x_min = min(f[0] for f in faces)
    y_min = min(f[1] for f in faces)
    x_max = max(f[0] + f[2] for f in faces)
    y_max = max(f[1] + f[3] for f in faces)

    # Fokuspunkt: horizontale Mitte der Gesichter, vertikal etwas ueber der
    # Mitte (Augenhoehe statt Kinn), damit beim Zuschneiden auf schmale/hohe
    # Container Augen+Stirn im Bild bleiben statt nur das Kinn.
    focus_x = (x_min + x_max) / 2
    focus_y = y_min + (y_max - y_min) * 0.35

    pct_x = round(float(focus_x) / w * 100, 1)
    pct_y = round(float(focus_y) / h * 100, 1)
    pct_x = max(0.0, min(100.0, pct_x))
    pct_y = max(0.0, min(100.0, pct_y))
    return f"{pct_x}% {pct_y}%"


def main():
    detector = cv2.FaceDetectorYN_create(MODEL_PATH, "", (320, 320), score_threshold=0.7)

    posts_path = "src/content-posts.json"
    posts_new_path = "src/content-posts-new.json"
    posts = json.load(open(posts_path))
    posts_new = json.load(open(posts_new_path))

    cache = {}
    no_face = []
    for post in posts + posts_new:
        img_url = post.get("featuredImage")
        if not img_url:
            continue
        if img_url not in cache:
            local_path = "public" + img_url
            pos = detect_position(local_path, detector)
            cache[img_url] = pos
            if pos == FALLBACK_POSITION:
                no_face.append(img_url)
        post["featuredImagePosition"] = cache[img_url]

    json.dump(posts, open(posts_path, "w"), ensure_ascii=False, indent=2)
    json.dump(posts_new, open(posts_new_path, "w"), ensure_ascii=False, indent=2)
    print(f"Verarbeitet: {len(cache)} eindeutige Bilder")
    print(f"Kein Gesicht erkannt (Fallback-Position): {len(no_face)}")
    for u in no_face:
        print(" -", u)


if __name__ == "__main__":
    main()
