/**
 * NanoMind Web Worker
 * Runs training and inference off the main thread to keep UI responsive
 */

// We'll inline a minimal version of the engine for the worker
// (Workers can't import relative ES modules in all browsers)

importScripts('./nanomind-engine.js');

let nm = null;

self.onmessage = async function(e) {
  const { type, payload } = e.data;

  switch (type) {

    case 'INIT': {
      try {
        nm = new NanoMind();
        postMessage({ type: 'INIT_OK' });
      } catch (err) {
        postMessage({ type: 'ERROR', payload: err.message });
      }
      break;
    }

    case 'LOAD_DATASET': {
      try {
        // Dataset is passed directly as object (already fetched)
        nm.dataset = payload.conversations;
        postMessage({ type: 'DATASET_OK', payload: { count: nm.dataset.length } });
      } catch (err) {
        postMessage({ type: 'ERROR', payload: err.message });
      }
      break;
    }

    case 'TRAIN': {
      try {
        await nm.train((progress, loss, epoch) => {
          postMessage({ type: 'TRAIN_PROGRESS', payload: { progress, loss, epoch } });
        });
        // Save trained model
        const modelJson = nm.saveModel();
        postMessage({ type: 'TRAIN_COMPLETE', payload: { modelSize: modelJson.length, modelJson } });
      } catch (err) {
        postMessage({ type: 'ERROR', payload: err.message });
      }
      break;
    }

    case 'LOAD_SAVED_MODEL': {
      try {
        nm = new NanoMind();
        nm.loadModel(payload.modelJson);
        // Restore RAG index from dataset
        if (payload.dataset) {
          nm.dataset = payload.dataset;
          nm.rag = new RAGEngine(nm.tokenizer);
          nm.rag.indexDataset(nm.dataset);
        }
        postMessage({ type: 'LOAD_OK' });
      } catch (err) {
        postMessage({ type: 'ERROR', payload: err.message });
      }
      break;
    }

    case 'GENERATE': {
      try {
        const { userInput, options } = payload;
        let fullResponse = '';

        await nm.generate(userInput, {
          ...options,
          onToken: (token) => {
            fullResponse += token;
            postMessage({ type: 'TOKEN', payload: { token } });
          }
        });

        postMessage({ type: 'GENERATE_COMPLETE', payload: { response: fullResponse } });
      } catch (err) {
        postMessage({ type: 'ERROR', payload: err.message });
      }
      break;
    }

    case 'CLEAR_HISTORY': {
      if (nm) nm.clearHistory();
      postMessage({ type: 'CLEARED' });
      break;
    }
  }
};
