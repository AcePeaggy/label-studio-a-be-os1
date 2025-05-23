import type { Meta, StoryObj } from "@storybook/react";
import { Tooltip } from "./Tooltip";
import { Button } from "../button/button";

const meta: Meta<typeof Tooltip> = {
  component: Tooltip,
  title: "UI/Tooltip",
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Primary: Story = {
  render: ({ children, ...props }) => {
    return (
      <div className="flex items-center gap-tight">
        <Tooltip {...props} title="Example of a tooltip">
          <Button>hover over me</Button>
        </Tooltip>
      </div>
    );
  },
};

export const WithLongText: Story = {
  render: ({ children, ...props }) => {
    return (
      <div className="flex items-center gap-tight">
        <Tooltip {...props} title="This is a tooltip with a very looooong long long text that goes past the size.">
          <Button>hover over me</Button>
        </Tooltip>
      </div>
    );
  },
};

export const WithLongTextString: Story = {
  render: ({ children, ...props }) => {
    return (
      <div className="flex items-center gap-tight">
        <Tooltip {...props} title="Thisisatooltipwithaverylooooonglonglongtextthatgoespastthesize.">
          <Button>hover over me</Button>
        </Tooltip>
      </div>
    );
  },
};

export const Interactive: Story = {
  render: ({ children, ...props }) => {
    return (
      <div className="flex items-center gap-tight">
        <Tooltip
          {...props}
          title={
            <div>
              <button type="button" onClick={() => alert("hello there")}>
                click me
              </button>
            </div>
          }
          interactive
        >
          <Button>hover over me</Button>
        </Tooltip>
      </div>
    );
  },
};
