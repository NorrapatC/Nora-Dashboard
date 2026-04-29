"use client";
import { Component, ReactNode } from "react";

interface Props { children: ReactNode; label?: string; }
interface State { hasError: boolean; message: string; }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="rounded-2xl px-5 py-6 text-center" style={{ border: "1.5px dashed #fca5a5", background: "#fef2f2" }}>
        <p className="text-xl mb-2">⚠️</p>
        <p className="text-sm font-semibold text-red-600 mb-1">
          {this.props.label ?? "Section"} เกิดข้อผิดพลาดค่ะ
        </p>
        <p className="text-xs text-red-400 mb-3">{this.state.message}</p>
        <button
          onClick={() => this.setState({ hasError: false, message: "" })}
          className="rounded-lg px-4 py-1.5 text-xs font-semibold text-white"
          style={{ background: "#ef4444" }}
        >
          ลองใหม่อีกครั้ง
        </button>
      </div>
    );
  }
}
