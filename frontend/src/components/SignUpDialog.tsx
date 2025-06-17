"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { api } from "@/lib/api"; 
// Ensure these types are correctly defined in your types file
import type { DailyLogCreate, UserCreateWithLog, UserRead } from "@/lib/types";

// --- The Prop Type Fix ---
// Instead of an array of strings, we accept an object where keys are strings
// (like 'in_attention') and values are the user's answers.
type SignUpDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  anonymousLogData: { [key: string]: string }; // The full responses object
  onSuccess: (newUser: UserRead) => void; 
};

export function SignUpDialog({ open, onOpenChange, anonymousLogData, onSuccess }: SignUpDialogProps) {
  // Internal state for the dialog's form
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // --- The Payload Fix ---
      // We now construct the log_data payload using the keys from the prop,
      // which is much safer and clearer.
      const logPayload: DailyLogCreate = {
        in_attention: anonymousLogData['in_attention'] || '',
        in_obsession: anonymousLogData['in_obsession'] || '',
        in_agency: anonymousLogData['in_agency'] || '',
        log_date: new Date().toISOString().split("T")[0],
      };

      // Assemble the final, nested payload
      const payload: UserCreateWithLog = {
        user_data: {
          ...formData, // Contains name and email
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        log_data: logPayload,
      };

      // --- The Efficiency Fix ---
      // The createUserWithLog endpoint already returns the new UserRead object.
      // We don't need a second API call to fetch the user.
      const newUser = await api.createUserWithLog(payload);
      onSuccess(newUser); // Pass the result directly to the success callback

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-[#f6f5e8] border-[#d6d3c1]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-[#333333]">
            Save Your Log
          </DialogTitle>
          <DialogDescription className="font-serif text-[#5c5c5c]">
            Create a free account to save this entry and track your progress.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right font-serif text-[#333333]">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="col-span-3 font-serif border-[#d6d3c1] focus-visible:ring-[#333333]"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right font-serif text-[#333333]">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="col-span-3 font-serif border-[#d6d3c1] focus-visible:ring-[#333333]"
            />
          </div>
        </div>
        {error && <p className="text-center text-sm text-red-600">{error}</p>}
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading || !formData.name || !formData.email}
            className="font-serif text-lg bg-[#333333] hover:bg-[#5c5c5c] text-white"
          >
            {isLoading ? "Saving..." : "Create Account & Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
