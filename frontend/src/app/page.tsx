"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import * as tf from "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";
import ChatView from "@/components/ChatView";
import WebcamView from "@/components/WebcamView";
import DeployView from "@/components/DeployView";

const DEBUG_MODE = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true';

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface TrainingStatus {
  progress: number;
  loss: number;
  accuracy: number;
  inProgress: boolean;
  complete: boolean;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Welcome to Project Aurora! To get started, upload some images for your dataset." },
  ]);
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [trainingStatus, setTrainingStatus] = useState<TrainingStatus>({ progress: 0, loss: 0, accuracy: 0, inProgress: false, complete: false });
  const [view, setView] = useState<"chat" | "webcam" | "deploy">("chat");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
    setMessages(prevMessages => [...prevMessages, { role: "system", content: `${acceptedFiles.length} images uploaded successfully.` }]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] } });

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { role: "user", content: input }]);
      setInput("");
    }
  };

  const handleTrain = async () => {
    if (files.length === 0) {
      setMessages(prev => [...prev, { role: "system", content: "Please upload images before training." }]);
      return;
    }

    if (DEBUG_MODE) {
        setTrainingStatus({ progress: 100, loss: 0, accuracy: 0, inProgress: false, complete: true });
        setMessages(prev => [...prev, { role: "assistant", content: "Model training complete! You can now test your model or deploy it." }]);
        return;
    }

    setTrainingStatus({ progress: 0, loss: 0, accuracy: 0, inProgress: true, complete: false });
    setMessages(prev => [...prev, { role: "assistant", content: "Starting model training..." }]);

    const mobilenetModel = await mobilenet.load();

    const imageTensors = await Promise.all(files.map(async file => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        await img.decode();
        return tf.browser.fromPixels(img).toFloat().resizeNearestNeighbor([224, 224]).expandDims();
    }));

    const embeddings = imageTensors.map(tensor => mobilenetModel.infer(tensor, true));

    const labels = tf.tensor2d(files.map((_, i) => i < files.length / 2 ? 0 : 1), [files.length, 1]);

    const model = tf.sequential({
        layers: [
            tf.layers.dense({inputShape: [1024], units: 128, activation: 'relu'}),
            tf.layers.dense({units: 1, activation: 'sigmoid'}),
        ]
    });

    model.compile({optimizer: 'adam', loss: 'binaryCrossentropy', metrics: ['accuracy']});

    const trainingData = tf.concat(embeddings);

    await model.fit(trainingData, labels, {
        epochs: 10,
        callbacks: {
            onEpochEnd: (epoch, logs) => {
                if(logs){
                    const progress = (epoch + 1) / 10 * 100;
                    setTrainingStatus({ progress: progress, loss: logs.loss || 0, accuracy: logs.acc || 0, inProgress: true, complete: false });
                }
            }
        }
    });

    setTrainingStatus({ progress: 100, loss: 0, accuracy: 0, inProgress: false, complete: true });
    setMessages(prev => [...prev, { role: "assistant", content: "Model training complete! You can now test your model or deploy it." }]);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 p-4 shadow-md">
        <h1 className="text-xl font-bold">Project Aurora</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {view === 'chat' && (
            <ChatView
                messages={messages}
                getRootProps={getRootProps}
                getInputProps={getInputProps}
                isDragActive={isDragActive}
                files={files}
                handleTrain={handleTrain}
                trainingStatus={trainingStatus}
                setView={setView}
            />
        )}
        {view === 'webcam' && <WebcamView setView={setView} />}
        {view === 'deploy' && <DeployView setView={setView} />}
      </main>

      <footer className="bg-gray-800 p-4">
        <div className="flex">
          <input type="text" className="flex-1 p-2 rounded-l-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === "Enter" && handleSend()} placeholder="Type your message..."/>
          <button onClick={handleSend} className="px-4 py-2 bg-blue-600 rounded-r-lg hover:bg-blue-700 focus:outline-none">Send</button>
        </div>
      </footer>
    </div>
  );
}
