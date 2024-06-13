import {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { Room as RoomModel } from "../models/rooms";
import { PostSection, PostTextSection, createPost } from "../models/posts";
import { useAuth } from "../hooks";
import { CreateIcon } from "../components/icons";
import styles from "./NewPostForm.module.css";

interface NewPostTextSectionProps {
  onCreate: (newSections: PostTextSection[]) => void;
  onDelete: () => void;
  onMergeBack: () => void;
  onUpdate: (updatedSection: PostTextSection) => void;
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
        onMergeBack();
    }
  }

  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    const [firstBodyPart, ...newBodyParts] = e.target.value.split(/\r?\n/);

    if (e.target.value === "") {
      onDelete();
    } else if (newBodyParts.length > 0) {
      onUpdate({ ...section, body: firstBodyPart });
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

interface NewPostSectionProps {
  onCreate: (newSections: PostSection[]) => void;
  onDelete: () => void;
  onMergeBack: () => void;
  onUpdate: (updatedSection: PostSection) => void;
  section: PostSection;
  showPlaceholder: boolean;
}

function NewPostSection({ section, ...props }: NewPostSectionProps) {
  if (section.type === "text")
    return <NewPostTextSection section={section} {...props} />;
  return <p>Unsupported section type</p>;
}

function generateBlankPostTextSection(): PostTextSection {
  return {
    id: crypto.randomUUID(),
    type: "text",
    body: "",
  };
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
        <button
          type="submit"
          className={styles.newPostButton}
          disabled={isLoading}
        >
          <CreateIcon />
          <span className={styles.newPostButtonText}>Post</span>
        </button>
      </div>
    </form>
  );
}
