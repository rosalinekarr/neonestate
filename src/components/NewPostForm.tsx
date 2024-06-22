import {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  MouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { Room as RoomModel } from "../models/rooms";
import {
  PostAttachmentSection,
  PostSection,
  PostTextSection,
  createPost,
} from "../models/posts";
import { useAuth, useImage, useUploadPostAttachment } from "../hooks";
import {
  AttachIcon,
  CreateIcon,
  DeleteIcon,
  EditIcon,
} from "../components/icons";
import styles from "./NewPostForm.module.css";
import IconButton from "./IconButton";

interface NewPostAttachmentSectionProps {
  onDelete: () => void;
  onUpdate: (updatedSection: PostSection) => void;
  section: PostAttachmentSection;
}

function generatePostAttachmentSection(path: string): PostAttachmentSection {
  return {
    id: crypto.randomUUID(),
    type: "attachment",
    path,
  };
}

function NewPostAttachmentSection({
  onDelete,
  onUpdate,
  section,
}: NewPostAttachmentSectionProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const uploadPostAttachment = useUploadPostAttachment();
  const attachmentUrl = useImage(section.path || "");

  function handleDelete(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    onDelete();
  }

  async function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length !== 1) return;
    const file = e.target.files[0] || null;

    try {
      const path = await uploadPostAttachment(file);
      console.log("path", path);
      onUpdate(generatePostAttachmentSection(path));
    } catch (e: any) {
      setError(e.message);
    }
  }

  useEffect(() => {
    if (inputRef.current && section.path === "") inputRef.current.click();
  }, []);

  return (
    <div className={styles.newPostAttachmentSection}>
      <div
        className={[
          styles.attachmentPreview,
          ...(attachmentUrl ? [] : [styles.blank]),
          ...(error ? [styles.error] : []),
        ].join(" ")}
        onClick={() => inputRef.current?.click()}
      >
        {attachmentUrl && (
          <img src={attachmentUrl} className={styles.attachmentPreviewImage} />
        )}
        <div className={styles.overlay}>
          <EditIcon />
        </div>
      </div>
      <div className={styles.attachmentActions}>
        {section.path && (
          <IconButton
            className={styles.attachmentButton}
            icon={DeleteIcon}
            onClick={handleDelete}
          >
            Delete
          </IconButton>
        )}
      </div>
      <input
        type="file"
        className={styles.fileInput}
        id="attachment"
        name="attachment"
        onChange={handleChange}
        ref={inputRef}
      />
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
}

interface NewPostTextSectionProps {
  onCreate: (newSections: PostSection[]) => void;
  onDelete: () => void;
  onMergeBack: () => void;
  onUpdate: (updatedSection: PostSection) => void;
  section: PostTextSection;
  showPlaceholder: boolean;
}

function generatePostTextSection(body: string): PostTextSection {
  return {
    id: crypto.randomUUID(),
    type: "text",
    body,
  };
}

function NewPostTextSection({
  onCreate,
  onDelete,
  onMergeBack,
  onUpdate,
  section,
  showPlaceholder,
}: NewPostTextSectionProps) {
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  function handleKeyDown(e: KeyboardEvent) {
    if (e.code === "Delete" || e.code === "Backspace") {
      if (section.body === "") onDelete();
      if (
        section.body !== "" &&
        textAreaRef.current?.selectionStart === 0 &&
        textAreaRef.current?.selectionEnd === 0
      )
        if (onMergeBack) onMergeBack();
    }
  }

  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    const [firstBodyPart, ...newBodyParts] = e.target.value.split(/\r?\n/);

    if (e.target.value === "") {
      onDelete();
    } else if (newBodyParts.length > 0) {
      onUpdate({ ...section, body: firstBodyPart });
      if (onCreate)
        onCreate(newBodyParts.map((body) => generatePostTextSection(body)));
    } else {
      onUpdate({ ...section, body: firstBodyPart });
    }
  }

  useEffect(() => {
    if (textAreaRef.current) textAreaRef.current.focus();
  }, []);

  useEffect(() => {
    if (!textAreaRef.current) return;
    textAreaRef.current.style.minHeight = "0";
    textAreaRef.current.style.minHeight = `${textAreaRef.current?.scrollHeight}px`;
  }, [section.body]);

  return (
    <textarea
      className={styles.newPostTextSection}
      dir="auto"
      ref={textAreaRef}
      rows={1}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={showPlaceholder ? "Say something..." : undefined}
      value={section.body}
    />
  );
}

function isNewPostAttachmentSectionProps(
  props: NewPostSectionProps,
): props is NewPostAttachmentSectionProps {
  return props.section.type === "attachment";
}

function isNewPostTextSectionProps(
  props: NewPostSectionProps,
): props is NewPostTextSectionProps {
  return props.section.type === "text";
}

interface NewPostSectionProps {
  onCreate?: (newSections: PostSection[]) => void;
  onDelete: () => void;
  onMergeBack?: () => void;
  onUpdate: (updatedSection: PostSection) => void;
  section: PostSection;
  showPlaceholder?: boolean;
}

function NewPostSection({ ...props }: NewPostSectionProps) {
  if (isNewPostAttachmentSectionProps(props))
    return <NewPostAttachmentSection {...props} />;
  if (isNewPostTextSectionProps(props))
    return <NewPostTextSection {...props} />;
  return <p>Unsupported section type</p>;
}

function generateBlankPostTextSection(): PostTextSection {
  return generatePostTextSection("");
}

interface NewPostFormProps {
  room: RoomModel;
  show: boolean;
}

export default function NewPostForm({ room, show }: NewPostFormProps) {
  const auth = useAuth();
  const [sections, setSections] = useState<PostSection[]>([
    generateBlankPostTextSection(),
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  function handleAddAttachment(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setSections((prevSections) => {
      const lastSection = prevSections[prevSections.length - 1];
      const sections =
        lastSection.type === "text" && lastSection.body === ""
          ? prevSections.slice(0, -1)
          : prevSections;
      return [
        ...sections,
        generatePostAttachmentSection(""),
        generatePostTextSection(""),
      ];
    });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    await createPost(auth, {
      roomId: room.id,
      sections,
    });
    setSections([generateBlankPostTextSection()]);
    setIsLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={[
        styles.newPostForm,
        ...(show ? [] : [styles.newPostFormHidden]),
      ].join(" ")}
    >
      <div className={styles.newPostFormContainer}>
        <div className={styles.newPostSections}>
          {sections.map((section: PostSection, index: number) => (
            <NewPostSection
              key={section.id}
              onCreate={(newSections: PostSection[]) =>
                setSections((prevSections: PostSection[]) =>
                  prevSections.toSpliced(index + 1, 0, ...newSections),
                )
              }
              onDelete={() =>
                setSections((prevSections: PostSection[]) => {
                  if (prevSections.length === 1)
                    return [generateBlankPostTextSection()];
                  if (index > 0) {
                    const precedingSection = prevSections[index - 1];
                    if (precedingSection.type === "text")
                      return prevSections.toSpliced(
                        index - 1,
                        2,
                        generatePostTextSection(precedingSection.body),
                      );
                  }
                  return prevSections.toSpliced(index, 1);
                })
              }
              onMergeBack={() => {
                setSections((prevSections: PostSection[]) => {
                  if (index > 0) {
                    const precedingSection = prevSections[index - 1];
                    const currentSection = prevSections[index];
                    if (
                      currentSection.type === "text" &&
                      precedingSection.type === "text"
                    )
                      return prevSections.toSpliced(
                        index - 1,
                        2,
                        generatePostTextSection(
                          precedingSection.body + currentSection.body,
                        ),
                      );
                  }
                  return prevSections;
                });
              }}
              onUpdate={(updatedSection: PostSection) =>
                setSections((prevSections: PostSection[]) =>
                  prevSections.toSpliced(index, 1, updatedSection),
                )
              }
              section={section}
              showPlaceholder={index === 0 && sections.length === 1}
            />
          ))}
        </div>
        <div className={styles.actionButtons}>
          <IconButton
            className={styles.attachButton}
            disabled={isLoading}
            icon={AttachIcon}
            onClick={handleAddAttachment}
          >
            Attach
          </IconButton>
          <IconButton
            className={styles.newPostButton}
            disabled={isLoading}
            icon={CreateIcon}
            type="submit"
          >
            Post
          </IconButton>
        </div>
      </div>
    </form>
  );
}
