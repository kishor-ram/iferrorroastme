import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Code2, Terminal, Trophy, Zap } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold text-foreground">If(Error) Roast();</span>
          </div>
          <Button onClick={() => navigate("/login")}>
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
            Master Coding with
            <span className="text-primary"> Instant Feedback</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Practice coding challenges, run tests instantly, and improve your skills with real-time feedback and motivation
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" onClick={() => navigate("/login")}>
              Start Coding
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/login")}>
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="p-8 rounded-lg border border-border bg-card hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Terminal className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Code Editor</h3>
            <p className="text-muted-foreground">
              Write Python or Java with a professional code editor supporting syntax highlighting and auto-completion
            </p>
          </div>

          <div className="p-8 rounded-lg border border-border bg-card hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Instant Testing</h3>
            <p className="text-muted-foreground">
              Run your code against multiple test cases and get immediate feedback on your solutions
            </p>
          </div>

          <div className="p-8 rounded-lg border border-border bg-card hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Track Progress</h3>
            <p className="text-muted-foreground">
              Monitor your test attempts, track improvements, and level up your coding skills over time
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center bg-primary/5 rounded-2xl p-12 border border-primary/20">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to start your coding journey?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join developers improving their skills through practice and instant feedback
          </p>
          <Button size="lg" onClick={() => navigate("/login")}>
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-6 py-8">
          <p className="text-center text-muted-foreground">
            Made with passion by Kishor
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
