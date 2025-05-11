import MoodDirectAccess from "@/components/mood-direct-access";

export default function MoodSelectorPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold text-center mb-6">Mood Selector</h1>
      <p className="text-center mb-8 max-w-2xl mx-auto text-muted-foreground">
        Select your current mood from the options below. This standalone implementation 
        doesn't rely on authentication or other complex dependencies.
      </p>
      
      <MoodDirectAccess />
    </div>
  );
}