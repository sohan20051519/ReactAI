import { Message, TrainingStatus } from "@/app/page";

interface ChatViewProps {
  messages: Message[];
  getRootProps: any;
  getInputProps: any;
  isDragActive: boolean;
  files: File[];
  handleTrain: () => void;
  trainingStatus: TrainingStatus;
  setView: (view: "chat" | "webcam" | "deploy") => void;
}

export default function ChatView({
  messages,
  getRootProps,
  getInputProps,
  isDragActive,
  files,
  handleTrain,
  trainingStatus,
  setView,
}: ChatViewProps) {
  return (
    <>
      {messages.map((msg, index) => (
        <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : msg.role === "system" ? "justify-center" : "justify-start"}`}>
          <div className={`max-w-lg p-3 rounded-lg ${ msg.role === "user" ? "bg-blue-600" : msg.role === "system" ? "bg-green-600" : "bg-gray-700"}`}>
            <p>{msg.content}</p>
          </div>
        </div>
      ))}

      <div {...getRootProps()} className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-gray-500">
        <input {...getInputProps()} />
        {isDragActive ? <p>Drop the files here ...</p> : <p>Drag 'n' drop some files here, or click to select files</p>}
      </div>

      {files.length > 0 && (
        <div className="text-center mt-4">
          <h2 className="text-lg font-semibold">Uploaded Files:</h2>
          <ul className="list-disc list-inside">{files.map((file, i) => <li key={i}>{file.name}</li>)}</ul>
          <button onClick={handleTrain} disabled={trainingStatus.inProgress} className="mt-4 px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-500">
            {trainingStatus.inProgress ? `Training... ${trainingStatus.progress.toFixed(0)}%` : "Train Model"}
          </button>
        </div>
      )}

      {trainingStatus.inProgress && (
          <div className="text-center mt-4">
              <p>Loss: {trainingStatus.loss.toFixed(4)} | Accuracy: {trainingStatus.accuracy.toFixed(4)}</p>
              <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${trainingStatus.progress}%` }}></div>
              </div>
          </div>
      )}

      {trainingStatus.complete && (
        <div className="text-center mt-4 space-x-4">
            <button onClick={() => setView('webcam')} className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700">Test with Webcam</button>
            <button onClick={() => setView('deploy')} className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700">Deploy Model</button>
        </div>
      )}
    </>
  );
}
