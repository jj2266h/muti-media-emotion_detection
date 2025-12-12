from flask import Flask, request, jsonify
from flask_cors import CORS
from deepface import DeepFace
import cv2
import numpy as np

app = Flask(__name__)
CORS(app)  # 允許 React 前端呼叫這個 API

@app.route('/api/analyze', methods=['POST'])
def analyze_image():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        # 1. 將上傳的檔案轉換為 OpenCV 格式
        file_bytes = np.frombuffer(file.read(), np.uint8)
        img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

        # 2. 使用 DeepFace 進行分析 (你的核心邏輯)
        # actions 包含情緒、年齡、種族、性別
        objs = DeepFace.analyze(img, 
                              actions=['emotion', 'age', 'gender', 'race'],
                              enforce_detection=False) # 設為 False 避免沒偵測到臉時報錯

        # 3. 整理回傳結果給前端
        results = []
        for res in objs:
            # DeepFace 的回傳結構可能會是 list 或 dict，視版本而定，這邊做通用處理
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
                "confidence": res.get('face_confidence', 0.9) # DeepFace 不一定有信心分數，給預設值
            })

        return jsonify({"results": results})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)