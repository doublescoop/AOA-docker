"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api"; 
import type { UserRead, DailyLogCreate, DailyLogCheckout, DailyLogRead, LinkDump } from "@/lib/types"; 
import Link from "next/link";
import { SignUpDialog } from "@/components/SignUpDialog";

  // Define a type for our questions for better organization
  type Question = {
    id: number;
    key: keyof DailyLogCreate | keyof DailyLogCheckout;
    title: string;
    question: string;
  };

  // --- QUESTION DEFINITIONS ---
  const checkinQuestions: Question[] = [
    { id: 0, key: 'in_attention', title: "Attention", question: "Where is your attention at today?" },
    { id: 1, key: 'in_obsession', title: "Obsession", question: "Are you obsessed with it?" },
    { id: 2, key: 'in_agency', title: "Agency", question: "What agency are you taking for it today?" },
  ];

  const checkoutQuestions: Question[] = [
    { id: 0, key: 'out_til1', title: "Today I Learned...", question: "(Be short, so you can remember)" },
    // { id: 1, key: 'out_til2', title: "Anything Else?", question: " " },
    // { id: 2, key: 'out_til3', title: "Even More?", question: " " },
    { id: 3, key: 'reading', title: "Reading?", question: "" },
    { id: 4, key: 'link_dumps', title: "Link Dumps", question: " " },
  ];

export default function Home() {
  // State for the logged-in user
  const [currentUser, setCurrentUser] = useState<UserRead | null>(null);
  const [formattedDate, setFormattedDate] = useState('');
  const [formattedDayOfWeek, setFormattedDayOfWeek] = useState('');
  const [formattedTime, setFormattedTime] = useState('');
  
  // Language setting - can be 'eng' or 'han'
  type Language = 'eng' | 'han';
  const language: Language = 'han'; // Easy toggle here

  // State for the UI and form
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(0);
  const [responses, setResponses] = useState<{ [key: string]: string }>({});
  const [viewMode, setViewMode] = useState<'checkin' | 'checkout'>('checkin');
  const [todaysLog, setTodaysLog] = useState<DailyLogRead | null>(null);
  const [dialogLogData, setDialogLogData] = useState<{ [key: string]: string }>({});
  
  // State for the result of an API call
  const [isSaveSuccess, setIsSaveSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for controlling the dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // This effect runs once when the component mounts to check for a logged-in user.
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user: UserRead = JSON.parse(storedUser);
      setCurrentUser(user);
      
      // If a user is found, check for today's log
      const today = new Date().toISOString().split("T")[0];
      api.getLogByDate(user.id, today)
        .then(log => {
          if (log) {
            setTodaysLog(log);
            // If they already checked in, switch to checkout mode
            if (log.in_attention) {
              setViewMode('checkout');
              // Pre-fill checkout responses from the fetched log
              setResponses({
                out_til1: log.out_til1 || '',
                out_til2: log.out_til2 || '',
                out_til3: log.out_til3 || '',
                reading: log.reading || '',
                link_dumps: Array.isArray(log.link_dumps) ? log.link_dumps.map((l: LinkDump) => l.url).join('\n') : '',
              });
            }
          }
        })
        .catch(err => {
          console.error(err);
          // Don't set an error in the UI for a 404, just means no log exists
          if (err.message.includes('404')) {
            // It's ok, no log for today yet.
          } else {
            setError('Could not fetch your daily log.');
          }
        });
    }
  }, []);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      
      // Format date
      const dateStr = now.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      }).toUpperCase();
      setFormattedDate(dateStr);

      // Format day of week based on language
      const dayOfWeek = now.getDay();
      const dayStr = language === 'han' 
        ? ['日', '月', '火', '水', '木', '金', '土'][dayOfWeek]
        : now.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
      setFormattedDayOfWeek(dayStr);

      // Format time with seconds
      const timeStr = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      setFormattedTime(timeStr);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, [language]);

  // --- Core Handlers for UI Interaction ---

  const handleExpand = (id: number) => {
    // If clicking the currently expanded question, collapse it
    if (expandedQuestion === id) {
      setExpandedQuestion(null);
    } else {
      setExpandedQuestion(id);
    }
  };
  
  const handleResponseChange = (key: string, value: string) => {
    setResponses(prev => ({ ...prev, [key]: value }));
  };
  
  // --- SAVE HANDLERS ---
  const handleSave = async () => {
    setIsLoading(true);
    setError(null);

    // Delegate to the correct save function based on the current view mode
    if (viewMode === 'checkout') {
      await handleCheckoutSave();
    } else {
      await handleCheckinSave();
    }
    
    setIsLoading(false);
  };

  const handleCheckinSave = async () => {
    if (currentUser) {
      const payload: DailyLogCreate = {
        in_attention: responses['in_attention'] || '',
        in_obsession: responses['in_obsession'] || '',
        in_agency: responses['in_agency'] || '',
        log_date: new Date().toISOString().split("T")[0],
      };
      try {
        await api.createDailyLog(payload, currentUser.id);
        setIsSaveSuccess(true);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(String(err));
        }
      }
    } else {
      // Open the sign-up dialog for anonymous users
      setDialogLogData(responses);
      setIsDialogOpen(true);
    }
  };
  
  const handleCheckoutSave = async () => {
    if (!currentUser || !todaysLog) return;
    
    // The link_dumps field needs to be an array of objects
    const links = (responses['link_dumps'] || '').split('\n').filter(Boolean).map((url: string) => ({ url }));

    const payload: DailyLogCheckout = {
      out_til1: responses['out_til1'] || '',
      out_til2: responses['out_til2'] || '',
      out_til3: responses['out_til3'] || '',
      reading: responses['reading'] || '',
      link_dumps: links
    };
    
    try {
      await api.createCheckoutLog(currentUser.id, todaysLog.log_date, payload);
      setIsSaveSuccess(true);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    }
  };

  /**
   * This function's ONLY job is to handle a successful sign-up FROM THE DIALOG, 
   * and save them to localStorage.
   */
  const handleDialogSuccess = (newUser: UserRead) => {
    // Save the new user to localStorage so they are logged in for future visits.
    localStorage.setItem('user', JSON.stringify(newUser));
    setCurrentUser(newUser);

    // After creating the user and their first log, we need to fetch that log
    // to update the UI state correctly (e.g., switch to checkout mode).
    const today = new Date().toLocaleDateString('sv');
    api.getLogByDate(newUser.id, today)
      .then(log => {
        if (log) {
          setTodaysLog(log);
          if (log.in_attention) {
            setViewMode('checkout');
          }
        }
      })
      .catch(err => {
        console.error("Failed to fetch log after signup:", err);
        // We can show an error, but for now, we'll just log it.
        // The main success message will still appear.
      });
    
    // Close the dialog and show the success message on the page.
    setIsDialogOpen(false);
    setIsSaveSuccess(true);
  };


  // --- Computed Values for Rendering ---
  // Determine which questions to display
  const questions = viewMode === 'checkin' ? checkinQuestions : checkoutQuestions;
  const allQuestionsAnswered = responses[questions[0].key]?.trim() !== '';
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* <header className="relative z-10 border-b p-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="font-serif text-2xl text-foreground">
              {viewMode === 'checkin' ? "Daily Check-in" : "Evening Checkout"}
          </h1>
        </div>
      </header> */}

      <main className="relative z-10 flex-grow container mx-auto px-4 py-8 md:py-16 w-[95%]">
        {/* Today's date and time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <div className="w-full flex justify-between items-baseline">
            <div className="flex items-baseline gap-x-3 sm:gap-x-6 px-4 md:px-12">
              <span className="font-saira text-[12vw] sm:text-[10vw] md:text-9xl font-bold leading-none">
                {formattedDate}
              </span>
              <span className="font-notoSc text-[12vw] sm:text-[10vw] md:text-9xl leading-none">
                {formattedDayOfWeek}
              </span>
            </div>
            <span className="font-saira text-[5vw] sm:text-[4vw] md:text-4xl px-4 md:px-24 font-normal leading-none">
              {formattedTime}
            </span>
          </div>
        </motion.div>
        {/* All the question mapping logic. */}
        <div className="space-y-12 pt-12 md:pt-24 px-4 sm:px-12 md:px-24">
          {questions.map((q, index) => (
            <motion.div key={q.id}>
              <div 
                className="cursor-pointer flex justify-between items-center" 
                onClick={() => handleExpand(q.id)}
              >
                <h3 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold text-foreground">{q.title}</h3>
                <motion.div
                  animate={{ rotate: expandedQuestion === q.id ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={48} />
                </motion.div>
              </div>
              {expandedQuestion === q.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="mt-4 overflow-hidden"
                >
                  <div className="flex items-end gap-x-4">
                    <Textarea 
                      value={responses[q.key] || ''}
                      onChange={(e) => handleResponseChange(q.key, e.target.value)}
                      placeholder={q.question}
                      rows={1}
                      className="flex-grow bg-transparent border-0 border-b border-foreground rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none text-lg sm:text-xl md:text-2xl py-2 placeholder:text-gray-400/80"
                    />
                    {index < questions.length - 1 && (
                      <Button
                        variant="outline"
                        className="rounded-full px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base"
                        onClick={() => handleExpand(index + 1)}
                        disabled={!(responses[q.key] || '').trim()}
                      >
                        Next
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {allQuestionsAnswered && !isSaveSuccess && (
          <motion.div className="mt-8 flex justify-center">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="font-serif text-lg sm:text-xl bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 sm:px-12 sm:py-6"
            >
              {isLoading ? "Saving..." : "Save Responses"}
              <Save className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
          </motion.div>
        )}
        
        {error && <p className="text-center mt-4 font-serif text-destructive">{error}</p>}
        {isSaveSuccess && (
          <motion.div /* ...props */ className="text-center mt-6">
            <p className="font-serif text-xl text-muted-foreground mb-4">
              Your entry has been saved!
            </p>
            <Link href="/dashboard">
              <Button variant="outline">View Your Dashboard</Button>
            </Link>

          </motion.div>
        )}
      </main>
      
      <SignUpDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        anonymousLogData={dialogLogData}// Pass the check-in answers
        onSuccess={handleDialogSuccess}
      />
      
      <footer className="relative z-10 border-t p-6 text-center font-serif text-sm text-muted-foreground">
        <p>AOA(attention-obsession-agency) © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}