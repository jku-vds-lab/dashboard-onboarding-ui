import React from "react";
import { useReactMediaRecorder } from "react-media-recorder";
import { saveInfoVideo } from "../../componentGraph/helperFunctions";
// redux starts
import type { RootState } from "../redux/store";
import { useSelector } from "react-redux";
// redux ends

interface Props {
  setShowMediaOptions: any;
}

export default function RecordView(props: Props) {
  // redux starts
  const nodeFullName = useSelector(
    (state: RootState) => state.nodeModal.fullName
  );
  const nodeBasicName = useSelector(
    (state: RootState) => state.nodeModal.basicName
  );
  // redux  ends

  const { status, startRecording, stopRecording, mediaBlobUrl, error } =
    useReactMediaRecorder({
      video: true,
      audio: true,
      screen: true,
    });

  const handleSave = async () => {
    props.setShowMediaOptions(false);
    try {
      if (mediaBlobUrl) {
        const blobResponse = await fetch(mediaBlobUrl);
        const blob = await blobResponse.blob();
        const file = new File([blob], "video.mp4", { type: blob.type }); // change to basic name from video.mp4
        const formData = new FormData();
        formData.append("video", file);

        const response = await fetch("http://127.0.0.1:8000/upload-video", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        console.log("Video uploaded successfully!", data);
        await assignVideoToNode();
      }
    } catch (error) {
      console.error("Error uploading video:", error);
    }
  };

  const assignVideoToNode = async () => {
    try {
      let category = "general";
      if (nodeFullName.length > 1) {
        category = nodeFullName[1];
      }

      const videoURL = "http://127.0.0.1:8000/get-video";

      saveInfoVideo(videoURL, nodeBasicName, [category], 1);

      localStorage.setItem(nodeBasicName + "video", videoURL);

      //
    } catch (error) {
      console.log("Error in assigning video to node", error);
    }
  };

  return (
    <div>
      <div id="recording">
        <button
          id="startRecording"
          className="btn btn-secondary btn-xs justify-content-center align-items-center"
          onClick={startRecording}
        >
          Start Recording
        </button>
        <button
          id="stopRecording"
          className="btn btn-secondary btn-xs justify-content-center align-items-center"
          onClick={stopRecording}
        >
          Stop Recording
        </button>
      </div>
      {mediaBlobUrl && (
        <button
          id="saveRecording"
          className="btn btn-secondary btn-xs justify-content-center align-items-center"
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
