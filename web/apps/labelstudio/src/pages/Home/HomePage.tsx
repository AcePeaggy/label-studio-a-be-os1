import type { Page } from "../types/Page";
import { SimpleCard, Spinner } from "@humansignal/ui";
import { IconExternal, IconFolderAdd, IconHumanSignal, IconUserAdd, IconFolderOpen } from "@humansignal/icons";
import { HeidiTips } from "../../components/HeidiTips/HeidiTips";
import { useQuery } from "@tanstack/react-query";
import { useAPI } from "../../providers/ApiProvider";
import { useCallback, useEffect, useState } from "react";
import { CreateProject } from "../CreateProject/CreateProject";
import { InviteLink } from "../Organization/PeoplePage/InviteLink";
import { Heading, Sub } from "@humansignal/typography";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import { Button } from "../../components";

const PROJECTS_TO_SHOW = 10;
const LOCALSTORAGE_IS_STAFF_KEY = "user_is_staff"

const resources = [
  {
    title: "Documentation",
    url: "https://labelstud.io/guide/",
  },
  {
    title: "API Documentation",
    url: "https://api.labelstud.io/api-reference/introduction/getting-started",
  },
  {
    title: "Release Notes",
    url: "https://labelstud.io/learn/categories/release-notes/",
  },
  {
    title: "LabelStud.io Blog",
    url: "https://labelstud.io/blog/",
  },
  {
    title: "Slack Community",
    url: "https://slack.labelstud.io",
  },
];

const staffOnlyActions = [
  { title: "Create Project", icon: IconFolderAdd, type: "createProject" as const },
  { title: "Invite People", icon: IconUserAdd, type: "invitePeople" as const },
];

type StaffActionType = (typeof staffOnlyActions)[number]["type"];

const getIsStaffFromLocalStorage = (): boolean => {
  try {
    const storedValue = localStorage.getItem(LOCALSTORAGE_IS_STAFF_KEY);
    if (storedValue === null) {
      // console.log("[HomePage] isStaff not found in localStorage, defaulting to false.");
      return false;
    }
    const parsedValue = JSON.parse(storedValue);
    // console.log(`[HomePage] isStaff read from localStorage: ${parsedValue}`);
    return parsedValue === true;
  } catch (e) {
    console.error("[HomePage] Failed to read/parse isStaff from localStorage, defaulting to false.", e);
    return false;
  }
};

export const HomePage: Page = () => {
  const api = useAPI();
  const history = useHistory();
  const [creationDialogOpen, setCreationDialogOpen] = useState(false);
  const [invitationOpen, setInvitationOpen] = useState(false);

  const [isStaff, setIsStaff] = useState<boolean>(getIsStaffFromLocalStorage());

  useEffect(() => {
    const updateStaffStatusFromStorage = () => {
      const valueFromStorage = getIsStaffFromLocalStorage();
      if (valueFromStorage !== isStaff) {
        // console.log("[HomePage] Updating isStaff state based on localStorage change or focus.");
        setIsStaff(valueFromStorage);
      }
    };

    window.addEventListener("storage", updateStaffStatusFromStorage);
    window.addEventListener("focus", updateStaffStatusFromStorage);
    updateStaffStatusFromStorage();

    return () => {
      window.removeEventListener("storage", updateStaffStatusFromStorage);
      window.removeEventListener("focus", updateStaffStatusFromStorage);
    };
  }, [isStaff]);

  // console.log("[HomePage] Rendering with isStaff status:", isStaff);

  const { data, isFetching, isSuccess, isError } = useQuery({
    queryKey: ["projects", { page_size: 10 }],
    async queryFn() {
      return api.callApi<{ results: APIProject[]; count: number }>("projects", {
        params: { page_size: PROJECTS_TO_SHOW },
      });
    },
  });

  const handleActions = useCallback((action: StaffActionType) => {
    return () => {
      if (!isStaff) return;
      switch (action) {
        case "createProject":
          setCreationDialogOpen(true);
          break;
        case "invitePeople":
          setInvitationOpen(true);
          break;
      }
    };
  }, [isStaff]);

  return (
    <main className="p-6">
      <div className="grid grid-cols-[minmax(0,1fr)_450px] gap-6">
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <Heading size={1}>Welcome 👋</Heading>
            <Sub>Let's get you started.</Sub>
          </div>
          {isStaff && (
            <div className="flex justify-start gap-4">
              {staffOnlyActions.map((action) => {
                return (
                  <Button
                    key={action.title}
                    rawClassName="flex-grow-0 text-16/24 gap-2 text-primary-content text-left min-w-[250px] [&_svg]:w-6 [&_svg]:h-6 pl-2"
                    onClick={handleActions(action.type)}
                  >
                    <action.icon className="text-primary-icon" />
                    {action.title}
                  </Button>
                );
              })}
            </div>
          )}

          <SimpleCard
            title={
              data && data?.count > 0 ? (
                <>
                  Recent Projects{" "}
                  <a href="/projects" className="text-lg font-normal hover:underline">
                    View All
                  </a>
                </>
              ) : null
            }
          >
            {isFetching ? (
              <div className="h-64 flex justify-center items-center"><Spinner /></div>
            ) : isError ? (
              <div className="h-64 flex justify-center items-center">can't load projects</div>
            ) : isSuccess && data?.results.length === 0 ? (
              isStaff ? (
                <div className="flex flex-col justify-center items-center border border-primary-border-subtle bg-primary-emphasis-subtle rounded-lg h-64 p-4 text-center">
                  <div className={"rounded-full w-12 h-12 flex justify-center items-center bg-accent-grape-subtle text-primary-icon mb-3"}>
                    <IconFolderOpen />
                  </div>
                  <Heading size={2}>Create your first project</Heading>
                  <Sub className="mt-1 mb-4">Import your data and set up the labeling interface to start annotating</Sub>
                  <Button primary rawClassName="mt-4" onClick={() => { if (isStaff) setCreationDialogOpen(true); }}>
                    Create Project
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col justify-center items-center border-primary-border-subtle bg-primary-emphasis-subtle rounded-lg h-64 p-4 text-center">
                  <div className={"rounded-full w-12 h-12 flex justify-center items-center bg-gray-200 text-gray-500 mb-3"}>
                    <IconFolderOpen />
                  </div>
                  <Heading size={2}>No projects available</Heading>
                  <Sub className="mt-1">You currently don't have access to any projects.</Sub>
                </div>
              )
            ) : isSuccess && data?.results.length > 0 ? (
              <div className="flex flex-col gap-1">
                {data?.results.map((project) => {
                  return <ProjectSimpleCard key={project.id} project={project} />;
                })}
              </div>
            ) : null}
          </SimpleCard>
        </section>
        <section className="flex flex-col gap-6">
          <HeidiTips collection="projectSettings" />
          <SimpleCard title="Resources" description="Learn, explore and get help" data-testid="resources-card">
            <ul>
              {resources.map((link) => {
                return (
                  <li key={link.title}>
                    <a
                      href={link.url}
                      className="py-2 px-1 flex justify-between items-center text-neutral-content"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {link.title}
                      <IconExternal className="text-primary-icon" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </SimpleCard>
          <div className="flex gap-2 items-center">
            <IconHumanSignal />
            <span className="text-neutral-content-subtle">Label Studio Version: Community</span>
          </div>
        </section>
      </div>
      {creationDialogOpen && <CreateProject onClose={() => setCreationDialogOpen(false)} />}
      <InviteLink opened={invitationOpen} onClosed={() => setInvitationOpen(false)} />
    </main>
  );
};

HomePage.title = "Home";
HomePage.path = "/";
HomePage.exact = true;

function ProjectSimpleCard({
  project,
}: {
  project: APIProject;
}) {
  const finished = project.finished_task_number ?? 0;
  const total = project.task_number ?? 0;
  const progress = (total > 0 ? finished / total : 0) * 100;
  const white = "#FFFFFF";
  const color = project.color && project.color !== white ? project.color : "#E1DED5";

  return (
    <Link
      to={`/projects/${project.id}`}
      className="block even:bg-neutral-surface rounded-sm overflow-hidden"
      data-external
    >
      <div
        className="grid grid-cols-[minmax(0,1fr)_150px] p-2 py-3 items-center border-l-[3px]"
        style={{ borderLeftColor: color }}
      >
        <div className="flex flex-col gap-1">
          <span className="text-neutral-content">{project.title}</span>
          <div className="text-neutral-content-subtler text-sm">
            {finished} of {total} Tasks ({total > 0 ? Math.round((finished / total) * 100) : 0}%)
          </div>
        </div>
        <div className="bg-neutral-surface rounded-full overflow-hidden w-full h-2 shadow-neutral-border-subtle shadow-border-1">
          <div className="bg-positive-surface-hover h-full" style={{ maxWidth: `${progress}%` }} />
        </div>
      </div>
    </Link>
  );
}
