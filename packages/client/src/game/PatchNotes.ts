interface PatchNote {
   version: string;
   content: [string, string][];
   link?: string;
}

export const PatchNotes: PatchNote[] = [
   {
      version: "0.1.0",
      content: [["Content", "Initial Release"]],
   },
];
