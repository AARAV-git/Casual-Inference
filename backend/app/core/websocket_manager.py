"""
Tracks active WebSocket connections per experiment_id so the Experiment
Lab (Section 7.3) can push live stage/progress updates instead of the
frontend polling GET /experiments/{id} on a timer.
"""
from fastapi import WebSocket


class WebSocketManager:
    def __init__(self):
        self._connections: dict[str, list[WebSocket]] = {}

    async def connect(self, experiment_id: str, websocket: WebSocket) -> None:
        await websocket.accept()
        self._connections.setdefault(experiment_id, []).append(websocket)

    def disconnect(self, experiment_id: str, websocket: WebSocket) -> None:
        if experiment_id in self._connections:
            self._connections[experiment_id].remove(websocket)
            if not self._connections[experiment_id]:
                del self._connections[experiment_id]

    async def broadcast(self, experiment_id: str, message: dict) -> None:
        """Called by the background training task to push {stage, progress, message}."""
        for ws in self._connections.get(experiment_id, []):
            await ws.send_json(message)


websocket_manager = WebSocketManager()
