interface WebcamViewProps {
  setView: (view: "chat" | "webcam" | "deploy") => void;
}

export default function WebcamView({ setView }: WebcamViewProps) {
  return (
    <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Webcam Preview</h2>
        <div className="bg-gray-800 w-full aspect-video rounded-lg flex items-center justify-center">
            <p>Webcam placeholder</p>
        </div>
        <button onClick={() => setView('chat')} className="mt-4 px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-700">Back to Chat</button>
    </div>
  );
}
