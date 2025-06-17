"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { UserRead, DailyLogRead } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; 

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState<UserRead | null>(null);
  const [logs, setLogs] = useState<DailyLogRead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);

      // Only fetch logs if we have a valid user ID
      if (user && user.id) {
        api.getLogsForUser(user.id)
          .then(data => {
            // Sort logs by date, most recent first
            const sortedLogs = data.sort((a, b) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime());
            setLogs(sortedLogs);
          })
          .catch(console.error)
          .finally(() => setIsLoading(false));
      } else {
        // If user is stored but invalid, or no ID, stop loading.
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!currentUser) {
    return (
      <div className="p-8 text-center">
        <p>Please <Link href="/" className="underline">sign in</Link> to view your dashboard.</p>
      </div>
    );
  }

  const readingLogs = logs.filter(log => log.reading);
  const linkDumpsLogs = logs.filter(log => log.link_dumps && log.link_dumps.length > 0);

  return (
    <div className="container mx-auto p-8">
      <h1 className="font-serif text-4xl mb-8">My attention and TIL records: </h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Attention</TableHead>
            <TableHead>Today I Learned</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length > 0 ? (
            logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{log.log_date}</TableCell>
                <TableCell>{log.in_attention || '—'}</TableCell>
                <TableCell>{log.out_til1 || '—'}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="text-center">No logs found yet.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="font-serif text-2xl mb-4">My reading/watching/listening list:</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Content</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {readingLogs.length > 0 ? (
                readingLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.log_date}</TableCell>
                    <TableCell>{log.reading}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">No reading logs found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div>
          <h2 className="font-serif text-2xl mb-4">Link Dumps!:</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Link(s)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {linkDumpsLogs.length > 0 ? (
                linkDumpsLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.log_date}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {log.link_dumps.map((link, index) => (
                          <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-500 break-all">
                            {link.url}
                          </a>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">No link dumps found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}