"use client";

import Image from "next/image";
import { useState, useEffect,useRef } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer,generatorAssistant } from "@/constants";
import { createFeedback } from "@/lib/actions/general.action";
// import { extractInterviewData } from "@/utils/extractInterviewData";


enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

// function extractInterviewData(messages: SavedMessage[]) {
//   const transcript = messages.map(m => m.content).join(" ");

//   // More flexible regex patterns
//   const roleMatch = transcript.match(/role(?: is|:)?\s*([a-zA-Z0-9\s]+)/i);
//   const levelMatch = transcript.match(/(?:level|experience level)(?: is|:)?\s*([a-zA-Z]+)/i);
//   const techstackMatch = transcript.match(/(?:tech(?: stack)?|technologies)(?: is| are|:)?\s*([a-zA-Z0-9,.\s]+)/i);
//   const typeMatch = transcript.match(/(?:type(?: of interview)?)(?: is|:)?\s*([a-zA-Z]+)/i);
//   const amountMatch = transcript.match(/(?:amount|number|how many questions)(?: is|:)?\s*(\d+)/i);

//   return {
//     role: roleMatch ? roleMatch[1].trim() : "",
//     level: levelMatch ? levelMatch[1].trim() : "",
//     techstack: techstackMatch ? techstackMatch[1].trim() : "",
//     type: typeMatch ? typeMatch[1].trim() : "",
//     amount: amountMatch ? parseInt(amountMatch[1]) : 3,
//   };
// }



const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const messagesRef = useRef<SavedMessage[]>([]);
messagesRef.current = messages;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");

  
  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
    };

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => {
      console.log("speech start");
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      console.log("speech end");
      setIsSpeaking(false);
    };

    const onError = (error: Error) => {
      console.log("Error:", error);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      console.log("handleGenerateFeedback");

      const { success, feedbackId: id } = await createFeedback({
        interviewId: interviewId!,
        userId: userId!,
        transcript: messages,
        feedbackId,
      });

      if (success && id) {
        router.push(`/interview/${interviewId}/feedback`);
      } else {
        console.log("Error saving feedback");
        router.push("/");
      }
    };

    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") {
        router.push("/");
      } else {
        handleGenerateFeedback(messages);
      }
    }
  }, [messages, callStatus, feedbackId, interviewId, router, type, userId]);


 useEffect(() => {
  const onCallEnd = async () => {
    setCallStatus(CallStatus.FINISHED);

    // Use a ref to always get the latest messages
      // const interviewData = await extractInterviewData(messagesRef.current);
      const response = await fetch("/api/extract-interview-data", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ messages: messagesRef.current }),
});
const interviewData = await response.json();
    const payload = {
      ...interviewData,
      userid: userId,
    };

    console.log("Extracted data:", payload);

    if (
      payload.role &&
      payload.level &&
      payload.techstack &&
      payload.type &&
      payload.amount
    ) {
      await fetch("/api/vapi/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
  };

  vapi.on("call-end", onCallEnd);

  return () => {
    vapi.off("call-end", onCallEnd);
  };
}, [userId]);



const handleCall = async () => {

  console.log("userId being sent:", userId);

    setCallStatus(CallStatus.CONNECTING);
    if (type === "generate") {
    // Use the prompt-based assistant, not the workflow
    await vapi.start(generatorAssistant, {
      variableValues: {
        username: userName,
        userid: userId,
      },
      clientMessages: ["transcript"],
      serverMessages: [],
    });
  } else {
      let formattedQuestions = "";
      if (questions) {
        formattedQuestions = questions
          .map((question) => `- ${question}`)
          .join("\n");
      }

      await vapi.start(interviewer, {
        variableValues: {
          questions: formattedQuestions,
        },
        clientMessages: ["transcript"],
        serverMessages: [],
      });
    }
  };


const handleDisconnect = () => {
  vapi.stop();
};


  return (
    <>
      <div className="call-view">
        {/* AI Interviewer Card */}
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="profile-image"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>

        {/* User Profile Card */}
        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              alt="profile-image"
              width={539}
              height={539}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={lastMessage}
              className={cn(
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100"
              )}
            >
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      <div className="w-full flex justify-center">
        {callStatus !== "ACTIVE" ? (
          <button className="relative btn-call" onClick={() => handleCall()}>
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />

            <span className="relative">
              {callStatus === "INACTIVE" || callStatus === "FINISHED"
                ? "Call"
                : ". . ."}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={() => handleDisconnect()}>
            End
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
