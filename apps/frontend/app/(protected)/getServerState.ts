import { PinterestAdapter } from "@/adapters/PinterestAdapter";
import { makeStore } from "@/store";

export async function getServerState() {
  const store = makeStore();

  try {
    const boards = await PinterestAdapter.getBoards();

    store.dispatch({
      type: "pinterest/fetchBoards/fulfilled",
      payload: boards,
    });
  } catch {
    store.dispatch({
      type: "pinterest/fetchBoards/rejected",
      error: { message: "Failed to load boards" },
    });
  }

  return store.getState();
}
