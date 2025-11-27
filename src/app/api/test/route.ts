export async function GET() {
  console.log("✅ Test route hit!");
  return Response.json({ message: "API routes work!" });
}
