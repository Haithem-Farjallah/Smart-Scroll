import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { FaGithub } from "react-icons/fa";
import "./popup.css";

type CommentData = {
  comment: Element;
  upvotes: number;
  timestamp: number;
};

const Popup = () => {
  const [currentURL, setCurrentURL] = useState<string>();
  const [currentComment, setCurrentComment] = useState<CommentData>();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [index, setIndex] = useState(0); // Changed from -1 to 0
  const [hasNext, setHasNext] = useState(true);
  const [hasLast, setHasLast] = useState(false);
  const [date, setDate] = useState("");
  console.log(currentURL);
  useEffect(() => {
    if (currentComment?.timestamp) {
      let d = new Date(currentComment.timestamp);
      setDate(
        d.getUTCHours() +
          ":" +
          (d.getUTCMinutes() < 10 ? "0" : "") +
          d.getUTCMinutes() +
          ", " +
          d.getDate() +
          "/" +
          (d.getMonth() + 1) +
          "/" +
          `${d.getFullYear()}`.slice(-2)
      );
    }
  }, [currentComment]);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      setCurrentURL(tabs[0].url);
    });
  }, []);

  const nextComment = () => {
    if (index + 1 < comments.length) {
      setIndex(index + 1);
    }
    if (index + 1 < comments.length) setHasNext(true);
    else setHasNext(false);
  };

  const prevComment = () => {
    if (index - 1 >= 0) {
      setIndex(index - 1);
    }
    if (index - 1 >= 0) setHasLast(true);
    else setHasLast(false);
  };

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = () => {
    sendMessage("loadComments", {}, (comments) => {
      setComments(comments);
      if (comments.length > 0) {
        setIndex(0);
        sendMessage("scrollTo", { index: 0 }, (currentComment) => {
          setCurrentComment(currentComment);
        });
        setHasNext(comments.length > 1);
        setHasLast(false);
      }
    });
  };

  const sendMessage = (
    type: string,
    message: object,
    responseCallback?: (res: any) => any
  ) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tab = tabs[0];
      if (tab.id) {
        if (responseCallback) {
          chrome.tabs.sendMessage(
            tab.id,
            { ...message, type },
            responseCallback
          );
        } else {
          chrome.tabs.sendMessage(tab.id, { ...message, type });
        }
      }
    });
  };

  useEffect(() => {
    if (comments.length > 0) {
      sendMessage("scrollTo", { index: index }, (currentComment) => {
        setCurrentComment(currentComment);
      });
      setHasNext(index + 1 < comments.length);
      setHasLast(index - 1 >= 0);
    }
  }, [index, comments.length]);

  return (
    <div className="popup">
      <div className="header">
        <div className="header-left">
          <p>Skip the Scroll</p>
          <a
            target="_blank"
            href={"https://github.com/Haithem-Farjallah/Smart-Scroll"}
          >
            <FaGithub className="icon" />
          </a>
        </div>
        <p className="subtext">1.0.0</p>
      </div>

      <div>
        {comments && comments.length > 0 ? (
          <div className="buttons">
            <button
              className={`btn-dark btn ${!hasLast && "disabled"}`}
              onClick={prevComment}
              disabled={!hasLast}
            >
              Prev
            </button>
            <div className="spacer" />
            <button
              className={`btn ${!hasNext && "disabled"}`}
              onClick={nextComment}
              disabled={!hasNext}
            >
              Next
            </button>
          </div>
        ) : (
          <div className="no-parse">
            <p className="subtext">Unable to parse the current tab</p>
          </div>
        )}
      </div>
      {comments && comments.length > 0 && (
        <div className="comment-info-container">
          {comments[0].upvotes === 0 && (
            <div className="no-upvotes">
              No upvotes found in this issue. Comments will be ordered by most
              recent{" "}
            </div>
          )}

          <p className="subtext">Comment Information:</p>
          <div className="comment-info-inner">
            <div className="comment-info-line" />
            <div className="comment-info">
              {currentComment ? (
                <>
                  <div className="comment-info-data">
                    <span className="comment-info-label">Total Upvotes:</span>
                    <span className="comment-info-value">
                      {currentComment.upvotes}
                    </span>
                  </div>
                  <div className="comment-info-data">
                    <span className="comment-info-label">Commented on:</span>
                    <span className="comment-info-value">{date}</span>
                  </div>
                  {index === 0 && comments[0].upvotes > 0 && (
                    <div className="highest-voted-container">
                      <p className="highest-voted">
                        ⭐ This is the most recent highest rated response
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="comment-info-data welcome-message">
                  <span className="comment-info-value">
                    Loading comments...
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Popup />
  </StrictMode>
);
