let comments: CommentData[] = [];

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.type === "loadComments") {
    console.log(sender, "*********************************");
    const _comments = parseComments();
    comments = _comments;
    console.log(comments, "++++++++++++++++++++++");
    sendResponse(comments);
    return true;
  }
  if (msg.type === "scrollTo") {
    const commentData = comments[Number(msg.index)];
    if (commentData) {
      const y =
        commentData.comment.getBoundingClientRect().top +
        window.pageYOffset +
        -128;
      window.scrollTo({ top: y, behavior: "smooth" });
      comments.forEach((comment) => {
        // @ts-ignore
        comment.comment.style = "box-shadow: 0px 0px 0px 0px";
      });
      // @ts-ignore
      commentData.comment.style = "box-shadow: 0px 0px 0px 1.5px #2BA44E;";
      sendResponse(commentData);
      return true;
    }
  }
  return true;
});

type CommentData = {
  comment: Element;
  upvotes: number;
  timestamp: number;
};

const parseComments = (): CommentData[] => {
  const comments: CommentData[] = [];
  const upvoteEmojis = ["👍", "😄", "🎉", "🚀", "❤️"];

  // Find all comment elements in the timeline
  const commentElements = document.querySelectorAll(
    '[data-testid^="comment-viewer-outer-box-"]'
  );

  commentElements.forEach((commentElement) => {
    try {
      let totalUpvotes = 0;

      const reactionElements = commentElement.querySelectorAll(
        '[role="toolbar"][aria-label="Reactions"] [data-component="buttonContent"]'
      );

      reactionElements.forEach((reactionElement) => {
        const emojiElement = reactionElement.querySelector(
          '[data-component="leadingVisual"]'
        );
        const countElement = reactionElement.querySelector(
          '[data-component="text"]'
        );

        if (emojiElement && countElement) {
          const emoji = emojiElement.textContent?.trim();
          const countText = countElement.textContent?.trim();

          if (emoji && upvoteEmojis.includes(emoji) && countText) {
            const count = parseInt(countText) || 0;
            totalUpvotes += count;
          }
        }
      });
      const timestampElement = commentElement.querySelector("relative-time");
      const timestamp = timestampElement
        ? new Date(timestampElement.getAttribute("datetime") || "").getTime()
        : Date.now();

      comments.push({
        comment: commentElement as HTMLElement,
        upvotes: totalUpvotes,
        timestamp: isNaN(timestamp) ? Date.now() : timestamp,
      });
    } catch (error) {
      console.error("Error parsing comment:", error, commentElement);
    }
  });
  sortComments(comments);
  return comments;
};

const sortComments = (comments: CommentData[]) => {
  comments
    .sort(function (x: CommentData, y: CommentData) {
      var n = x.upvotes - y.upvotes;
      if (n !== 0) {
        return n;
      }

      return x.timestamp - y.timestamp;
    })
    .reverse();
};
