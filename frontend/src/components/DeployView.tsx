interface DeployViewProps {
  setView: (view: "chat" | "webcam" | "deploy") => void;
}

export default function DeployView({ setView }: DeployViewProps) {
  return (
    <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Deployment Options</h2>
        <div className="space-y-4">
            <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold">Live API Endpoint</h3>
                <p className="text-gray-400">API endpoint will be available here.</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold">Embed in your website</h3>
                <p className="text-gray-400">Iframe code will be available here.</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold">Download Model</h3>
                <p className="text-gray-400">Download links for ONNX, TFLite, etc.</p>
            </div>
        </div>
        <button onClick={() => setView('chat')} className="mt-4 px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-700">Back to Chat</button>
    </div>
  );
}
