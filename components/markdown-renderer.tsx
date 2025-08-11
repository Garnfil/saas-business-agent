import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownRenderer({
    children,
}: {
    children: string;
}) {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                // Paragraphs
                p: ({node, ...props}) => (
                    <p
                        style={{
                            lineHeight: "1.6",
                        }}
                        {...props}
                    />
                ),

                // Links
                a: ({node, ...props}) => (
                    <a
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            color: "#3b82f6",
                            textDecoration: "none",
                            fontWeight: "500",
                        }}
                        {...props}
                    />
                ),

                // Lists
                ul: ({node, ...props}) => (
                    <ul
                        style={{
                            paddingLeft: "1.5em",
                            margin: "1em 0",
                            listStyleType: "disc",
                        }}
                        {...props}
                    />
                ),
                ol: ({node, ...props}) => (
                    <ol
                        style={{
                            paddingLeft: "1.5em",
                            margin: "2em 0",
                            listStyleType: "decimal",
                        }}
                        {...props}
                    />
                ),
                li: ({node, ...props}) => (
                    <li style={{marginBottom: ".5em"}} {...props} />
                ),

                // Headings
                h1: ({node, ...props}) => (
                    <h1
                        style={{
                            fontSize: "1.8em",
                            fontWeight: "bold",
                            margin: "1em 0 0.5em",
                        }}
                        {...props}
                    />
                ),
                h2: ({node, ...props}) => (
                    <h2
                        style={{
                            fontSize: "1.5em",
                            fontWeight: "bold",
                            margin: "1em 0 0.5em",
                        }}
                        {...props}
                    />
                ),
                h3: ({node, ...props}) => (
                    <h3
                        style={{
                            fontSize: "1.25em",
                            fontWeight: "bold",
                            margin: "1em 0 0.5em",
                        }}
                        {...props}
                    />
                ),

                // Blockquote
                blockquote: ({node, ...props}) => (
                    <blockquote
                        style={{
                            borderLeft: "4px solid #ccc",
                            paddingLeft: "1em",
                            margin: "1em 0",
                            fontStyle: "italic",
                            color: "#555",
                        }}
                        {...props}
                    />
                ),

                // Tables
                table: ({node, ...props}) => (
                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            margin: "1em 0",
                            fontSize: "0.9em",
                        }}
                        {...props}
                    />
                ),
                thead: ({node, ...props}) => <thead {...props} />,
                tbody: ({node, ...props}) => <tbody {...props} />,
                th: ({node, ...props}) => (
                    <th
                        style={{
                            border: "1px solid #ccc",
                            padding: "8px",
                            backgroundColor: "#f9fafb",
                            fontWeight: "600",
                            textAlign: "left",
                        }}
                        {...props}
                    />
                ),
                td: ({node, ...props}) => (
                    <td
                        style={{
                            border: "1px solid #ccc",
                            padding: "8px",
                            verticalAlign: "top",
                        }}
                        {...props}
                    />
                ),

                // Images
                img: ({node, ...props}) => (
                    <img
                        style={{
                            maxWidth: "100%",
                            borderRadius: "8px",
                            margin: "1em 0",
                        }}
                        alt=""
                        {...props}
                    />
                ),
            }}
        >
            {children}
        </ReactMarkdown>
    );
}
