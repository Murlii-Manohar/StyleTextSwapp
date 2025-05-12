import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDown } from "lucide-react";

const examples = [
  {
    from: {
      style: "Formal",
      text: "Kindly let me know your availability.",
    },
    to: {
      style: "Casual",
      text: "Hey, when are you free?",
    },
  },
  {
    from: {
      style: "Academic",
      text: "The research demonstrates a significant correlation between the variables.",
    },
    to: {
      style: "Casual",
      text: "Our study shows these things are definitely connected!",
    },
  },
];

export default function ExamplesSection() {
  return (
    <section className="mt-12">
      <h3 className="text-lg font-semibold text-neutral-800 mb-4">Example Transformations</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {examples.map((example, index) => (
          <Card key={index} className="border border-neutral-200">
            <CardContent className="pt-4">
              <div className="mb-2">
                <Badge variant="secondary" className="bg-neutral-200 text-neutral-800 hover:bg-neutral-300">
                  {example.from.style}
                </Badge>
                <p className="mt-1 text-neutral-700">{example.from.text}</p>
              </div>
              <div className="flex items-center my-2 justify-center">
                <ArrowDown className="h-4 w-4 text-neutral-400" />
              </div>
              <div>
                <Badge variant="default" className="bg-primary-500 hover:bg-primary-600">
                  {example.to.style}
                </Badge>
                <p className="mt-1 text-neutral-700">{example.to.text}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
