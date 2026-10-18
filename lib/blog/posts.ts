export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  sourceUrl: string;
  paragraphs: string[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "the-opinionated-engineer",
    title: "The Opinionated Engineer",
    description:
      "When taste becomes identity, practical engineering gets harder than it needs to be.",
    publishedAt: "2026-10-17T04:26:03.509Z",
    sourceUrl: "https://angrybayblade.substack.com/p/the-opinionated-engineer",
    paragraphs: [
      "\"We should use planetscale, it’s reliable, scales well and is easy to integrate” proposed the engineer as an alternative to a production DB that handled ~5 million transactions and ~30 million read queries IN a discussion about debugging random CPU spikes in the database cluster. Now, without the context the argument holds well - yes, planetscale is reliable, scales well, has great DX and is a great choice for starting a new project but you cannot move a system that already operates at scale just because you like working with planetscale. And this is the reason why you’re reading the blog/essay/rant.",
      "I’ve worked with startups for the entirety of my career and if you have worked for a startup at least once, you might’ve come across a person whose entire thing is having opinions. They might have competence to back them up but we’re not talking about that today; we’re talking about having opinions and confusing them with your entire being.",
      "Having opinions is a good thing as long as you treat them as opinions and dump them onto other people while keeping the context of the conversation intact - but this is an argument for an ideal world, and the world of software engineering is the wild wild west right now. Software engineering is getting more and more convoluted every day with advancements in AI and having to work with the “opinionated engineer” in this time is just 10x harder than it was before. Before AI, you could dismiss the argument by saying yes planetscale is a good option but rewriting the entire infra just to accommodate your preference is a mammoth task and we should look for a more practical solution, now you get hit in the face with “BuT Ai CAn DO iT In DAYs” and this is the worst you have to deal with that day next to renewing your car insurance. The bigger problem is the managers who are somewhat AI-pilled and think that “Yes, this is a great idea. Let’s rewrite a large chunk of infra that handles thousands of our existing customers and has a feature surface so thinly stretched that there is no guarantee that an AI powered rewrite will not end up creating more issues than it solves. Let’s do it!” and you’re sitting there rethinking the time when you were a hopelessly naive intern who got shouted at for rewriting a function to improve the code readability.",
      "Tech in general has a tendency to pull people who have a superiority complex driven by intellect, leading to confusion between something being a right solution in their head and something being a practical solution for the given problem. And this leads to one of the most commonly observed phenomena in software engineering I like to call Rewrite to establish supremacy complex. I have worked with engineers more than once who from the moment of joining a team start pushing for optimising things by performing refactors or introducing workflows without taking time to settle in and learn the current priorities of the team. I have been this engineer on more than one occasion. And again, the managers share equal blame in the scenario with the engineer because it’s the manager’s job to make sure the engineer gets time to settle in before they start swinging the axe and to make sure the team is aligned on priorities and approaches solutions in a more practical manner.",
      "When it comes to startups, there’s one more layer to the intellectual superiority that is “the purpose”. For some reason, working at a startup leads people to develop this delusion of having to solve a “PROBLEM” (no, you’re not solving a novel problem by introducing a better email client). Combining this delusion on top of the superiority makes dealing with these opinions even harder since now you’re not just dealing with an impractical way of doing something but you’re also hurting someone by saying no, your new opinionated developer tool does not introduce anything new. The problem we’re trying to solve has already been solved a million times before this so let’s just stick to the solution THAT IS BORING and might not help you establish your SUPERIORITY but will work fine. And yes, I said you are hurting someone because you are - and that is somewhat the point of this essay. If you are someone who has a lot of opinions but does not know how to separate them from practical solutions, learn how to before you exhaust yourself and everyone else around you. If you are someone on the other side, just learn how to dismiss the impractical solutions without turning it into an argument.",
      "As a final note to this, the advent of AI has created this narrative that you need to have taste to be relevant in the era of AI-driven software engineering. And in itself, the idea holds value but has a fatal flaw that is people tend to confuse having taste with having opinions. Nowadays almost everyone has an opinion that they try to project as having taste but forgets the fact that you’re there to solve a problem at the end of the day. And YES most of the problems have practical, tried and tested solutions that don’t have to reflect your personal taste. I would argue that opinion without context or practical relevance is just preference. So learn how to understand and solve problems; opinions can come in later - because in an argument of opinions attached to identity, nobody wins.",
    ],
  },
];

export function getBlogPost(slug: string) {
  return BLOG_POSTS.find((post) => post.slug === slug);
}
