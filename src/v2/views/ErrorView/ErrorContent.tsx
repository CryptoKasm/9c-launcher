import React from "react";
import Layout from "src/v2/components/core/Layout";
import H1 from "src/v2/components/ui/H1";

interface ErrorContentProps {
  title: string;
  content?: string;
  children?: React.ReactNode;
}

export default function ErrorContent({
  title,
  content,
  children,
}: ErrorContentProps) {
  return (
    <Layout flex sidebar>
      <H1>{title}</H1>
      {content && <p>{content}</p>}
      {children}
    </Layout>
  );
}
