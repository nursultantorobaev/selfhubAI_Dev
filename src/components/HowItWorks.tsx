import { Search, Calendar, Star } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Find your service",
    description: "Browse through thousands of beauty and wellness professionals",
  },
  {
    icon: Calendar,
    title: "Book instantly",
    description: "Choose your preferred time and book appointments in seconds",
  },
  {
    icon: Star,
    title: "Enjoy & review",
    description: "Get the service and share your experience with others",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">How it works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Book your next beauty appointment in three simple steps
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <step.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
