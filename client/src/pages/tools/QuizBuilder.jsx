export default function QuizBuilder() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Quiz Builder</h1>
        <p className="text-gray-600 mt-2">Create interactive quizzes for your audience (ScoreApp alternative)</p>
      </div>

      <div className="card">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-semibold mb-2">Build Custom Quizzes</h2>
          <p className="text-gray-600 mb-6">Create quizzes like your AI Impact Authenticator with custom questions, result types, and styling</p>
          <button className="btn btn-primary">Create Your First Quiz</button>
        </div>

        <div className="mt-8 pt-8 border-t">
          <h3 className="font-semibold mb-4">Features:</h3>
          <ul className="space-y-2 text-gray-600">
            <li>✅ Multiple choice, scale, and text questions</li>
            <li>✅ Custom result types (e.g., Groupie, Roadie, Support Act, Headliner)</li>
            <li>✅ Branded quiz pages with custom colors</li>
            <li>✅ Public URLs: daitaniverse.space/quiz/your-slug</li>
            <li>✅ Response analytics and result breakdown</li>
            <li>✅ CSV export of all responses</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
