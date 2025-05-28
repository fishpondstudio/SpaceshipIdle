import { Text } from "@mantine/core";
import { PatchNotes } from "../game/PatchNotes";

export function PatchNotesModal(): React.ReactNode {
   return (
      <div style={{ width: "35vw" }}>
         {PatchNotes.map((patch) => {
            return (
               <div key={patch.version}>
                  <div className="text-lg">{patch.version}</div>
                  {patch.content.map((line, idx) => {
                     return (
                        <Text key={idx} size="sm">
                           <Text c="space" span>
                              [{line[0]}]{" "}
                           </Text>
                           <Text span>{line[1]}</Text>
                        </Text>
                     );
                  })}
               </div>
            );
         })}
      </div>
   );
}
