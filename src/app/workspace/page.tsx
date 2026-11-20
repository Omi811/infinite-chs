import WorkspaceClient from "./WorkspaceClient";

export const dynamic = "force-dynamic";

export default async function WorkspacePage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-3xl">📑</span>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Google Workspace &amp; Working Canvas
          </h1>
        </div>
        <p className="text-gray-500 mt-1">
          Work with Google Sheets, draft society notices, and keep persistent calculation scratch inside Infinite.
        </p>
      </div>

      <WorkspaceClient />
    </div>
  );
}
