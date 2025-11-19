"use client";

import { useState } from "react";

import { useAuth } from "@/hooks";
import * as Sentry from "@sentry/nextjs";

export default function SentryTestPage() {
  const { user } = useAuth();
  const [serverResult, setServerResult] = useState("");
  const [clientResult, setClientResult] = useState("");

  if (!user || user.role !== "admin") {
    return (
      <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
        <h1>Access Denied</h1>
        <p>This page is only accessible to administrators.</p>
      </div>
    );
  }

  const testServerSentry = () => {
    void (async () => {
      try {
        const res = await fetch("/api/sentry-test");
        const data = (await res.json()) as { message: string };
        setServerResult(JSON.stringify(data, null, 2));
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setServerResult(`Error: ${message}`);
      }
    })();
  };

  const testClientSentry = () => {
    try {
      Sentry.captureMessage("Client-side Sentry test", "info");
      setClientResult(
        "Client-side test message sent. Check your Sentry dashboard."
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setClientResult(`Error: ${message}`);
    }
  };

  const testClientErrorManual = () => {
    try {
      // Manually caught error
      throw new Error("Test error from client side - manually caught");
    } catch (err) {
      Sentry.captureException(err);
      setClientResult(
        "Client-side error manually captured. Check your Sentry dashboard."
      );
    }
  };

  const testServerError = () => {
    void (async () => {
      try {
        const res = await fetch("/api/sentry-test-error");
        const data = (await res.json()) as { message: string; error: string };
        setServerResult(JSON.stringify(data, null, 2));
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setServerResult(`Error: ${message}`);
      }
    })();
  };

  return (
    <div
      style={{
        padding: "20px",
        display: "flex",
        flex: 1,
        flexDirection: "column",
        justifyContent: "start",
        alignItems: "center",
        background: "#f9f9f9",
        borderRadius: "8px",
      }}
    >
      <h1>Sentry Test Page</h1>
      <p style={{ color: "#666", marginBottom: "30px" }}>
        All errors are automatically caught by Sentry&apos;s global handlers.
      </p>

      <div
        style={{
          marginBottom: "30px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h2>Server-Side Tests</h2>
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <button
            onClick={testServerSentry}
            style={{
              padding: "10px 20px",
              cursor: "pointer",
              background: "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "5px",
            }}
          >
            Test Server Message
          </button>
          <button
            onClick={testServerError}
            style={{
              padding: "10px 20px",
              cursor: "pointer",
              background: "#f44336",
              color: "white",
              border: "none",
              borderRadius: "5px",
            }}
          >
            Test Server Error
          </button>
        </div>
        {serverResult && (
          <pre
            style={{
              background: "#f5f5f5",
              padding: "10px",
              borderRadius: "5px",
              overflow: "auto",
            }}
          >
            {serverResult}
          </pre>
        )}
      </div>

      <div
        style={{
          marginBottom: "30px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h2>Client-Side Tests</h2>
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "10px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={testClientSentry}
            style={{
              padding: "10px 20px",
              cursor: "pointer",
              background: "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "5px",
            }}
          >
            Test Client Message
          </button>
          <button
            onClick={testClientErrorManual}
            style={{
              padding: "10px 20px",
              cursor: "pointer",
              background: "#f44336",
              color: "white",
              border: "none",
              borderRadius: "5px",
            }}
          >
            Test Client Error (Manual)
          </button>
          <button
            onClick={() => {
              throw new Error("Unhandled error - caught by Sentry!");
            }}
            style={{
              padding: "10px 20px",
              cursor: "pointer",
              background: "#d32f2f",
              color: "white",
              border: "none",
              borderRadius: "5px",
            }}
          >
            Trigger Unhandled Error
          </button>
          <button
            onClick={() => {
              throw new Error(
                "Another unhandled error - also caught by Sentry!"
              );
            }}
            style={{
              padding: "10px 20px",
              cursor: "pointer",
              background: "#9c27b0",
              color: "white",
              border: "none",
              borderRadius: "5px",
            }}
          >
            Trigger Another Unhandled Error
          </button>
          <button
            onClick={() => {
              void Promise.reject(
                new Error("Unhandled promise rejection - caught by Sentry!")
              );
            }}
            style={{
              padding: "10px 20px",
              cursor: "pointer",
              background: "#673ab7",
              color: "white",
              border: "none",
              borderRadius: "5px",
            }}
          >
            Trigger Promise Rejection
          </button>
        </div>
        {clientResult && (
          <pre
            style={{
              background: "#f5f5f5",
              padding: "10px",
              borderRadius: "5px",
              overflow: "auto",
            }}
          >
            {clientResult}
          </pre>
        )}
      </div>

      <div
        style={{
          padding: "20px",
          background: "#fff3cd",
          borderRadius: "8px",
        }}
      >
        <h3>Instructions:</h3>
        <ol>
          <li>
            Click &quot;Test Server Message&quot; to send an info message from
            the server
          </li>
          <li>
            Click &quot;Test Server Error&quot; to trigger a server-side error
          </li>
          <li>
            Click &quot;Test Client Message&quot; to send an info message from
            the client
          </li>
          <li>
            Click &quot;Test Client Error (Manual)&quot; to test manually caught
            errors
          </li>
          <li>
            Click &quot;Trigger Unhandled Error&quot; buttons to test automatic
            error capture
          </li>
          <li>
            Click &quot;Trigger Promise Rejection&quot; to test unhandled
            promise rejections
          </li>
          <li>
            Check your Sentry dashboard at{" "}
            <a
              href="https://sentry.io"
              target="_blank"
              rel="noopener noreferrer"
            >
              sentry.io
            </a>
          </li>
        </ol>
        <p style={{ marginTop: "15px", color: "#856404" }}>
          <strong>Note:</strong> Unhandled errors are automatically captured by
          Sentry&apos;s global handlers without needing ErrorBoundary wrappers.
        </p>
      </div>
    </div>
  );
}
