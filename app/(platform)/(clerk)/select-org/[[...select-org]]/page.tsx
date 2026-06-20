import { OrganizationList } from "@clerk/nextjs";

const CreateOrganizationPage = () => {
  return (
    <OrganizationList
      afterCreateOrganizationUrl="/organization/:id"
      afterSelectOrganizationUrl="/organization/:id"
      hidePersonal
    />
  );
};

export default CreateOrganizationPage;
