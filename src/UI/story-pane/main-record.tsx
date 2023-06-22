import React from "react";
import { useReactMediaRecorder } from "react-media-recorder";
import { saveInfoVideo } from "../../onboarding/ts/helperFunctions";

export default function RecordView() {
  const { status, startRecording, stopRecording, mediaBlobUrl, error } =
    useReactMediaRecorder({
      video: true,
      audio: true,
      screen: true,
    });

  const handleSave = async () => {
    try {
      if (mediaBlobUrl) {
        const formData = new FormData();
        formData.append("file", mediaBlobUrl);

        const response = await fetch("http://127.0.0.1:8000/upload-video", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        console.log("Video uploaded successfully!", data);
        debugger;

        const nodeId = document
          ?.getElementById("Upload-Video")
          ?.getAttribute("nodeId");
        const currentIdParts = nodeId?.split(" ");
        let category = "general";
        if (currentIdParts!.length > 2) {
          category = currentIdParts![1];
        }
        saveInfoVideo(
          "C:\\Users\\Vaishali\\Desktop\\dashboard-onboarding-master\\dashboard-onboarding\\dashboard-onboarding\\uploads\\screen-recording.mp4",
          currentIdParts![0],
          [category],
          1
        );
      }
    } catch (error) {
      console.error("Error uploading video:", error);
    }
  };

  return (
    <div>
      <div id="recording">
        <button
          id="startRecording"
          className="btn btn-secondary btn-xs d-flex justify-content-center align-items-center"
          onClick={startRecording}
        >
          Start Recording
        </button>
        <button
          id="stopRecording"
          className="btn btn-secondary btn-xs d-flex justify-content-center align-items-center"
          onClick={stopRecording}
        >
          Stop Recording
        </button>
      </div>
      {mediaBlobUrl && (
        <button
          className="btn btn-secondary btn-xs d-flex justify-content-center align-items-center"
          onClick={handleSave}
        >
          Save
        </button>
      )}
      {/* <video src={mediaBlobUrl} controls autoPlay loop /> */}
    </div>
  );
}

// https://pro2future-my.sharepoint.com/:v:/g/personal/vaishali_dhanoa_pro2future_at/EePprVnwemtKsqcSQDbjG5wBm9-To0CJwUs1ybCfR3URJQ?e=DwO76U
