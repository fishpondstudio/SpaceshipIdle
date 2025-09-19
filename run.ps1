Start-Process -FilePath "powershell" -WorkingDirectory "packages/client" -ArgumentList "-C pnpm run dev"
Start-Process -FilePath "powershell" -WorkingDirectory "packages/server" -ArgumentList "-C pnpm run start"
