import { useEffect, useState } from "react";
import { User } from "../components";
import {
  Post as PostModel,
  PostAttachmentSection as PostAttachmentSectionModel,
  PostSection as PostSectionModel,
  PostTextSection as PostTextSectionModel,
} from "../models/posts";
import { formatAgo, msUntilNextAgoFormatChange } from "../utils";
import styles from "./Post.module.css";
import { useImage } from "../hooks";

interface TimestampProps {
  ts: Date;
}

function Timestamp({ ts }: TimestampProps) {
  const [agoStr, setAgoStr] = useState<string>(formatAgo(ts));

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    function setTimeoutForAgoString() {
      timeoutId = setTimeout(() => {
        setAgoStr(formatAgo(ts));
        setTimeoutForAgoString();
      }, msUntilNextAgoFormatChange(ts));
    }

    setTimeoutForAgoString();
    return () => {
      if (timeoutId) clearInterval(timeoutId);
    };
  }, []);

  return (
    <p className={styles.postCreatedBy} title={ts.toISOString()}>
      {agoStr}
    </p>
  );
}

interface PostTextSectionProps {
  section: PostTextSectionModel;
}

function PostTextSection({ section }: PostTextSectionProps) {
  return (
    <p className={styles.postText} dir="auto">
      {section.body}
    </p>
  );
}

interface PostAttachmentSectionProps {
  section: PostAttachmentSectionModel;
}

function PostAttachmentSection({ section }: PostAttachmentSectionProps) {
  const imageUrl = useImage(section.path);
  return imageUrl ? (
    <img src={imageUrl} className={styles.attachmentImage} />
  ) : null;
}

interface PostSectionProps {
  section: PostSectionModel;
}

function PostSection({ section }: PostSectionProps) {
  if (section.type === "attachment")
    return <PostAttachmentSection section={section} />;
  if (section.type === "text") return <PostTextSection section={section} />;
  return <p>Unsupported post section type.</p>;
}

interface PostProps {
  post: PostModel;
}

export default function Post({ post }: PostProps) {
  return (
    <article className={styles.post}>
      <div className={styles.postMetadata}>
        <User id={post.authorId} />
        <Timestamp ts={new Date(post.createdAt * 1000)} />
      </div>
      <div className={styles.content}>
        {post.sections.map((s) => (
          <PostSection key={s.id} section={s} />
        ))}
      </div>
    </article>
  );
}
