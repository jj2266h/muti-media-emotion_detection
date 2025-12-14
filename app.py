import os
import tempfile
from flask import Flask, request, jsonify
from flask_cors import CORS
from deepface import DeepFace
import cv2
import numpy as np

app = Flask(__name__)
CORS(app)

@app.route('/api/analyze', methods=['POST'])
def analyze_media():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    temp_path = None
    img = None

    try:
        # 1. 判斷檔案類型
        is_video = file.content_type.startswith('video') or \
                   file.filename.lower().endswith(('.mp4', '.mov', '.avi', '.webm'))

        if is_video:
            # === 影片處理邏輯 ===
            print(f"正在處理影片: {file.filename}")
            
            # OpenCV 讀取影片需要真實路徑，所以先存成暫存檔
            suffix = os.path.splitext(file.filename)[1]
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp:
                file.save(temp.name)
                temp_path = temp.name

            # 開啟影片
            cap = cv2.VideoCapture(temp_path)
            
            if not cap.isOpened():
                return jsonify({'error': '無法開啟影片檔'}), 400

            # 取得總幀數
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            
            # 策略：抓取影片「中間」的那一幀 (避免開頭是黑畫面)
            if total_frames > 1:
                cap.set(cv2.CAP_PROP_POS_FRAMES, total_frames // 2)
            
            ret, frame = cap.read()
            cap.release()

            if not ret or frame is None:
                return jsonify({'error': '無法讀取影片幀'}), 400
            
            img = frame

        else:
            # === 圖片處理邏輯 (原本的) ===
            print(f"正在處理圖片: {file.filename}")
            file_bytes = np.frombuffer(file.read(), np.uint8)
            img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

        if img is None:
             return jsonify({'error': '無效的影像資料'}), 400

        # 2. 使用 DeepFace 進行分析
        # enforce_detection=False: 即使沒偵測到臉也不要報錯 (會回傳空結果或全圖分析)
        objs = DeepFace.analyze(img, 
                              actions=['emotion', 'age', 'gender', 'race'],
                              enforce_detection=False)

        # 3. 整理結果
        results = []
        
        # DeepFace 有時回傳 list, 有時回傳 dict (視版本而定)
        if isinstance(objs, dict):
            objs = [objs]

        for res in objs:
            # 過濾掉信心度太低的誤判 (DeepFace 偶爾會把背景看成臉)
            if res.get('face_confidence', 1.0) < 0.4:
                continue

            results.append({
                "bbox": [
                    res['region']['y'], 
                    res['region']['x'], 
                    res['region']['y'] + res['region']['h'], 
                    res['region']['x'] + res['region']['w']
                ],
                "emotion": res['dominant_emotion'],
                "age": res['age'],
                "gender": res['dominant_gender'],
                "race": res['dominant_race'],
                "confidence": res.get('face_confidence', 0.9)
            })

        print(f"分析完成，找到 {len(results)} 張臉")
        return jsonify({"results": results})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500
    
    finally:
        # 清理暫存檔
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == '__main__':
    app.run(debug=True, port=5000)