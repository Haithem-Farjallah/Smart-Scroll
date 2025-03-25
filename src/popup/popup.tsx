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
  const [index, setIndex] = useState(-1);
  const [hasNext, setHasNext] = useState(true);
  const [hasLast, setHasLast] = useState(false);
  const [date, setDate] = useState("");
  console.log(currentURL, date, setCurrentComment, setHasLast);
  useEffect(() => {
    let d = new Date(currentComment?.timestamp!);
    setDate(
      d.getUTCHours() +
        ":" +
        (d.getUTCMinutes() < 10 ? "0" : "") +
        d.getUTCMinutes() +
        ", " +
        (d.getMonth() + 1) +
        "/" +
        d.getDate() +
        "/" +
        `${d.getFullYear()}`.slice(-2)
    );
  }, [currentComment]);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      setCurrentURL(tabs[0].url);
      console.log(tabs[0]);
    });
  }, []);

  const nextComment = () => {
    if (index + 1 < comments.length) {
      setIndex(index + 1);
    }
    if (index + 1 < comments.length) setHasNext(true);
    else setHasNext(false);
  };

  const lastComment = () => {
    if (index - 1 >= 0) {
      setIndex(index - 1);
    }
  };

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = () => {
    sendMessage("loadComments", {}, (comments) => {
      setComments(comments);
    });
  };

  const sendMessage = (
    type: string,
    message: object,
    responseCallback?: (res: any) => any
  ) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tab = tabs[0];
      console.log(tab);
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
              className={`btn-dark btn  ${!hasLast && "disabled"}`}
              onClick={lastComment}
              disabled={!hasLast}
            >
              Last
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
      {/* {comments && comments.length > 0 && (
        <div className="comment-info-container">
          <p className="subtext">Comment Information:</p>
          <div className="comment-info-inner">
            <div className="comment-info-line" />
            <div className="comment-info">
              {currentComment ? (
                <>
                  <CommentInfoItem
                    text="Total Upvotes:"
                    data={`${currentComment.upvotes}`}
                  />
                  <CommentInfoItem text="Commented on:" data={date} />
                  {index === 0 ? (
                    <AnimatedMount delay={0.2}>
                      <div className="highest-voted-container">
                        <p className="highest-voted">
                          This is the most recent highest rated response
                        </p>
                      </div>
                    </AnimatedMount>
                  ) : (
                    <></>
                  )}
                </>
              ) : (
                <CommentInfoItem text="Click next to start sifting through the top rated comments! ❤️" />
              )}
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Popup />
  </StrictMode>
);
