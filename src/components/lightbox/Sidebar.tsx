import { ActionIcon, Box, Group, Stack, Text, Title, useComputedColorScheme, useMantineTheme } from "@mantine/core";
import { IconMap2 as Map2, IconPhoto as Photo, IconX as X } from "@tabler/icons-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import "react-virtualized/styles.css";

import type { Photo as PhotoType } from "../../actions/photosActions.types";
import { api } from "../../api_client/api";
import { photoDetailsApi } from "../../api_client/photos/photoDetail";
import { notification } from "../../service/notifications";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { LocationMap } from "../LocationMap";
import { Tile } from "../Tile";
import { ModalPersonEdit } from "../modals/ModalPersonEdit";
import { Description } from "./Description";
import { PersonDetail } from "./PersonDetailComponent";
import { TimestampItem } from "./TimestampItem";
import { VersionComponent } from "./VersionComponent";

type Props = {
  isPublic: boolean;
  id: string;
  closeSidepanel: () => void;
  setFaceLocation: (face: any) => void;
};

export function Sidebar(props: Props) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [personEditOpen, setPersonEditOpen] = useState(false);
  const [selectedFaces, setSelectedFaces] = useState<any[]>([]);
  const { isPublic, closeSidepanel, setFaceLocation, id } = props;

  const photoDetail: PhotoType = useAppSelector(store => store.photoDetails.photoDetails[id]);
  const theme = useMantineTheme();
  const colorScheme = useComputedColorScheme();

  const notThisPerson = (faceId: number) => {
    const ids = [faceId];
    dispatch(api.endpoints.setFacesPersonLabel.initiate({ faceIds: ids, personName: "Unknown - Other" }));
    notification.removeFacesFromPerson(ids.length);
    dispatch(photoDetailsApi.endpoints.fetchPhotoDetails.initiate(photoDetail.image_hash)).refetch();
  };

  return (
    <Box
      style={{
        width: "33%",
        height: "100%",
        overflowY: "scroll",
        overflowX: "hidden",
        float: "right",
        whiteSpace: "normal",
        zIndex: 250,
        padding: theme.spacing.sm,
        backgroundColor: colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0],
      }}
    >
      {photoDetail && (
        <Stack>
          <Group justify="space-between">
            <Title order={3}>Details</Title>
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() => {
                closeSidepanel();
              }}
            >
              <X />
            </ActionIcon>
          </Group>
          {/* Start Item Time Taken */}
          <TimestampItem photoDetail={photoDetail} isPublic={isPublic} />
          {/* End Item Time Taken */}
          {/* Start Item File Path */}
          <VersionComponent photoDetail={photoDetail} isPublic={isPublic} />
          {/* End Item File Path */}
          {/* Start Item Location */}

          {photoDetail.search_location && (
            <Stack>
              <Title order={4}>
                <Map2 /> {t("lightbox.sidebar.location")}
              </Title>
              <Text>{photoDetail.search_location}</Text>
            </Stack>
          )}

          <div
            style={{
              whiteSpace: "normal",
              lineHeight: "normal",
            }}
          >
            {photoDetail.exif_gps_lat && <LocationMap photos={[photoDetail]} />}
          </div>

          {/* End Item Location */}
          {/* Start Item People */}

          {photoDetail.people.length > 0 && (
            <Stack>
              <Title order={4}>People</Title>
              {photoDetail.people.map(person => (
                <PersonDetail
                  key={person.name}
                  person={person}
                  isPublic={isPublic}
                  setFaceLocation={setFaceLocation}
                  onPersonEdit={(faceId, faceUrl) => {
                    setSelectedFaces([{ face_id: faceId, face_url: faceUrl }]);
                    setPersonEditOpen(true);
                  }}
                  notThisPerson={notThisPerson}
                />
              ))}
            </Stack>
          )}

          {/* End Item People */}
          {/* Start Item Caption */}
          <Description photoDetail={photoDetail} isPublic={isPublic} />

          {/* Start Item Similar Photos */}
          {photoDetail.similar_photos.length > 0 && (
            <div>
              <Group>
                <Photo />
                <Title order={4}>{t("lightbox.sidebar.similarphotos")}</Title>
              </Group>
              <Text>
                <Group gap="xs">
                  {photoDetail.similar_photos.slice(0, 30).map(el => (
                    <Tile video={el.type.includes("video")} height={85} width={85} image_hash={el.image_hash} />
                  ))}
                </Group>
              </Text>
            </div>
          )}
          {/* End Item Similar Photos */}
        </Stack>
      )}
      <ModalPersonEdit
        isOpen={personEditOpen}
        onRequestClose={() => {
          setPersonEditOpen(false);
          setSelectedFaces([]);
          dispatch(photoDetailsApi.endpoints.fetchPhotoDetails.initiate(photoDetail.image_hash)).refetch();
        }}
        selectedFaces={selectedFaces}
      />
    </Box>
  );
}
