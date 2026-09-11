import { Bookmark, BookmarkCheck, CheckCircle2, Terminal, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import GlassCard from "../components/GlassCard.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatePanel from "../components/StatePanel.jsx";
import { linuxLessons } from "../data/mockData.js";

const quizOptions = ["-a", "-z", "--force"];

export default function LinuxLearningCenter() {
  const [selected, setSelected] = useState(linuxLessons[0]);
  const [terminalInput, setTerminalInput] = useState("ls -lah /training");
  const [bookmarks, setBookmarks] = useState([]);
  const [quizAnswer, setQuizAnswer] = useState("");

  const progress = useMemo(() => Math.round((bookmarks.length / linuxLessons.length) * 100), [bookmarks.length]);
  const isBookmarked = bookmarks.includes(selected.section);

  const selectLesson = (lesson) => {
    setSelected(lesson);
    setTerminalInput(lesson.syntax);
    setQuizAnswer("");
  };

  const toggleBookmark = () => {
    setBookmarks((current) => (
      current.includes(selected.section)
        ? current.filter((section) => section !== selected.section)
        : [...current, selected.section]
    ));
  };

  return (
    <div className="page-enter">
      <PageHeader
        eyebrow="Learning Center"
        title="Linux command training"
        description="Practice safe command literacy with explanations, examples, common mistakes, a non-executing terminal, and quick quizzes."
      />
      <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
        <GlassCard>
          <h2 className="text-lg font-semibold text-white">Sections</h2>
          <div className="mt-4 space-y-2">
            {linuxLessons.map((lesson) => (
              <button
                key={lesson.section}
                onClick={() => selectLesson(lesson)}
                className={`w-full rounded-lg border p-3 text-left transition ${
                  selected.section === lesson.section
                    ? "border-blue-500/30 bg-blue-500/10 text-blue-100"
                    : "border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-900"
                }`}
              >
                <p className="text-sm font-medium">{lesson.section}</p>
                <p className="text-xs text-zinc-500">{lesson.command}</p>
              </button>
            ))}
          </div>
          <div className="mt-5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
            <p className="text-sm font-medium text-emerald-100">Daily Command</p>
            <p className="mt-1 font-mono text-lg text-white">journalctl</p>
            <p className="mt-1 text-xs leading-5 text-zinc-400">Review logs in a controlled learning environment.</p>
          </div>
        </GlassCard>
        <div className="space-y-4">
          <GlassCard>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">{selected.section}</h2>
                <p className="mt-2 text-zinc-400">{selected.explanation}</p>
              </div>
              <button
                className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white hover:bg-zinc-900"
                onClick={toggleBookmark}
              >
                {isBookmarked ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
                {isBookmarked ? "Bookmarked" : "Bookmark"}
              </button>
            </div>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                <p className="text-sm text-zinc-500">Syntax</p>
                <p className="mt-2 break-all font-mono text-blue-100">{selected.syntax}</p>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                <p className="text-sm text-zinc-500">Progress Tracker</p>
                <div className="mt-3 h-2 rounded-full bg-zinc-800"><div className="h-2 rounded-full bg-emerald-400" style={{ width: `${progress}%` }} /></div>
                <p className="mt-2 text-xs text-zinc-500">{bookmarks.length} of {linuxLessons.length} lessons bookmarked</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <h3 className="text-lg font-semibold text-white">Examples and Common Mistakes</h3>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                {selected.examples.map((example) => <p key={example} className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 font-mono text-sm text-emerald-100">{example}</p>)}
              </div>
              <div className="space-y-2">
                {selected.mistakes.map((mistake) => <p key={mistake} className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3 text-sm text-yellow-100">{mistake}</p>)}
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-white"><Terminal size={19} /> Non-Executing Terminal</h3>
            <div className="mt-4 rounded-lg border border-zinc-800 bg-black p-4 font-mono text-sm">
              <p className="text-emerald-300">analyst@cyberops-training:~$</p>
              <input className="mt-2 w-full bg-transparent text-blue-100 outline-none" value={terminalInput} onChange={(event) => setTerminalInput(event.target.value)} aria-label="Training terminal command" />
              <p className="mt-4 whitespace-pre-wrap text-zinc-400">{`Training output for: ${terminalInput}\nNo commands are executed. This is a visual learning surface only.`}</p>
            </div>
          </GlassCard>
          <GlassCard>
            <h3 className="text-lg font-semibold text-white">Quiz</h3>
            <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-zinc-300">Which flag commonly includes hidden files in directory listings?</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {quizOptions.map((answer) => {
                  const selectedAnswer = quizAnswer === answer;
                  const correct = answer === "-a";
                  return (
                    <button
                      key={answer}
                      onClick={() => setQuizAnswer(answer)}
                      className={`rounded-lg border p-3 text-sm ${
                        selectedAnswer && correct
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
                          : selectedAnswer
                            ? "border-red-500/30 bg-red-500/10 text-red-100"
                            : "border-zinc-800 bg-black text-zinc-300 hover:bg-zinc-900"
                      }`}
                    >
                      {selectedAnswer && correct && <CheckCircle2 className="mr-2 inline" size={16} />}
                      {selectedAnswer && !correct && <XCircle className="mr-2 inline" size={16} />}
                      {answer}
                    </button>
                  );
                })}
              </div>
              {quizAnswer && (
                <StatePanel
                  type={quizAnswer === "-a" ? "success" : "error"}
                  title={quizAnswer === "-a" ? "Correct" : "Try again"}
                  message={quizAnswer === "-a" ? "The -a flag includes hidden files in ls output." : "That option is not used for hidden files in ls."}
                  className="mt-4"
                />
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
