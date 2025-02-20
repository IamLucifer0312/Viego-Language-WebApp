"use client";
import Button from "@/components/ui/Button";
import StarIcon from "@/components/icons/StarIcon";
import { useState } from "react";
import {
  correctRecognizedTextVoice,
  recognizeVoice,
  recordHistory,
  uploadAudio,
  createAiVoice,
  addFavorite,
} from "@/api";
import { pushSuccess } from "@/components/Toast";
import { extractText } from "@/components/helper/ExtractText";
import Loading from "@/components/Loading";
import FeatureFrame from "@/components/FeatureFrame";
import { useHeader } from "@/context/HeaderContext";

const Voice = () => {
  const [currState, setCurrState] = useState("begin");
  const [isSaved, setSave] = useState(false);
  const formData = new FormData();
  const [recognizedText, setRecognizedText] = useState("");
  const [correctText, setCorrectText] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [resultAudio, setResultAudio] = useState(null);
  const [loading, setLoading] = useState(false); // State to manage loading status
  const [comment, setComment] = useState([]);
  const [currentRecord, setCurrentRecord] = useState(null);
  const { updateHeaderData } = useHeader();

  const handleFileChange = (file) => {
    console.log("receive file", file);
    if (file instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAudioUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (newFileUpload) => {
    try {
      setAudioUrl(URL.createObjectURL(newFileUpload));
      var [res, resAudio] = await handleVoiceRecognize(newFileUpload);
      var text = extractText(res, "corrected_text");
      var cmt = extractText(res, "errors");
      if (text !== null) {
        var audioId = await handleUploadFile(newFileUpload);
        var audio_answer = await handleUploadFile(resAudio);
        await handleRecordHistory(audioId, audio_answer, "audio", text, cmt);
        await updateHeaderData(); // fetch data again on header
      } else console.log("correctText is null");
    } catch (error) {
      console.error("Error submitting file:", error);
    }
  };

  const handleRecordHistory = async (
    audio,
    audio_answer,
    type,
    answer,
    comment
  ) => {
    console.log("handleRecordHistory");
    const formData = new FormData();
    // Change this to current username when authentication is implemented
    formData.append("username", localStorage.getItem("username"));
    formData.append("time", new Date().toISOString());
    formData.append("type", type);
    formData.append("favorite", "false");
    formData.append("audioId", audio);
    formData.append("audioAnsId", audio_answer);
    formData.append("answer", answer);
    formData.append("comment", JSON.stringify(comment));

    try {
      const res = await recordHistory(formData);
      console.log("API response:", res);
      setCurrentRecord(res.newRecord._id);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
    return;
  };

  const handleUploadFile = async (newFileUpload) => {
    console.log("handleUploadFile", newFileUpload);
    try {
      const res = await uploadAudio(newFileUpload);
      console.log("API response:", res);
      return res.audioId;
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleVoiceRecognize = async (newFileUpload) => {
    console.log("handleVoiceRecognize", newFileUpload);
    formData.append("audio", newFileUpload);
    handleFileChange(formData.getAll("file")[0]);
    setLoading(true); // Set loading to true before API requests
    pushSuccess("Successfully submitted!");
    try {
      const resTextRecognize = await recognizeVoice(formData);
      console.log("API response:", resTextRecognize);
      if (resTextRecognize) {
        // Assuming success check
        setRecognizedText(resTextRecognize.text);
        console.log("has response");
        const resCorrect = await correctRecognizedTextVoice(resTextRecognize);
        console.log("response text", resCorrect);
        setComment(extractText(resCorrect, "errors"));
        if (resCorrect) {
          const correctedText = extractText(resCorrect, "corrected_text");
          // after get correct text
          setCorrectText(correctedText);
          // send correct text for ai voice reading
          const resAudio = await createAiVoice(correctedText);
          if (resAudio) {
            setResultAudio(URL.createObjectURL(resAudio));
            setCurrState("process");
            return [resCorrect, resAudio];
          }
        }
      }
      //   return null;
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFavorite = async (imageId) => {
    const formData = new FormData();
    !isSaved
      ? formData.append("favorite", "true")
      : formData.append("favorite", "false");
    try {
      const res = await addFavorite(formData, imageId);
      console.log("API response:", res);
    } catch (error) {
      console.error("Error adding favorite:", error);
    } finally {
      setSave(!isSaved);
    }
  };

  return (
    <div className="h-full">
      <div className="h-5/6 my-10">
        <div className="flex justify-between">
          <Button
            text="Upload a new one"
            onClick={() => {
              setCurrState("begin");
              window.location.reload();
            }}
            style="bg-pink md:py-2 p-2 md:text-base text-sm md:ml-20 ml-8 hover:bg-orange"
          />
          <Button
            text={
              <span className="inline-flex place-items-center">
                <StarIcon isFilled={isSaved} style={{ marginRight: "5px" }} />
                {"Star this answer"}
              </span>
            }
            style={`mr-20 md:py-2 px-4 rounded inline md:text-base text-sm  ${
              currState != "process" && "hidden"
            }`}
            onClick={() => handleAddFavorite(currentRecord)}
          />
        </div>

        <div className="overflow-y-auto h-full border border-black bg-gray-100 py-4 md:mx-20 mx-8 rounded-lg grid md:grid-cols-2 relative place-items-center">
          {loading ? (
            <Loading />
          ) : (
            <FeatureFrame
              type="voice"
              props={{
                currState,
                setCurrState,
                audioUrl,
                recognizedText,
                handleSubmit,
                comment,
                correctText,
                resultAudio,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Voice;
