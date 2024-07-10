import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Modal } from "@/components/modal";
import { Participant, ParticipantProps } from "@/components/participant";
import { TripLink, TripLinkProps } from "@/components/tripLink";
import { linksServer } from "@/server/links-server";
import { participantsServer } from "@/server/participants-server";
import { colors } from "@/styles/colors";
import { validateInput } from "@/utils/validateInput";
import { Plus } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, FlatList, Text, View } from "react-native";

export function Details({ tripId }: { tripId: string }) {
  //MODAL
  const [showNewLinkModal, setShowNewLinkModal] = useState(false);

  //LOADING
  const [isCreatingLinkTrip, setIsCreatingLinkTrip] = useState(false);

  //LISTS
  const [links, setLinks] = useState<TripLinkProps[]>([]);

  //DATA
  const [linkTitle, setLinkTitle] = useState("");
  const [linkURL, setLinkURL] = useState("");
  const [guests, setGuests] = useState<ParticipantProps[]>([]);

  function resetNewLinkFields() {
    setLinkTitle("");
    setLinkURL("");
    setShowNewLinkModal(false);
  }

  async function handleCreateTripLink() {
    try {
      if (!linkTitle.trim()) {
        return Alert.alert("Link", "Enter the title of the link");
      }
      if (!validateInput.url(linkURL.trim())) {
        return Alert.alert("Link", "Invalid Link!");
      }

      setIsCreatingLinkTrip(true);

      await linksServer.create({
        tripId,
        title: linkTitle,
        url: linkURL,
      });

      Alert.alert("Link", "Link created successfully!");
      resetNewLinkFields();
      await getTripLinks();
    } catch (error) {
      console.log(error);
    } finally {
      setIsCreatingLinkTrip(false);
    }
  }

  async function getTripLinks() {
    try {
      const links = await linksServer.getLinksByTripId(tripId);
      setLinks(links);
    } catch (error) {
      console.log(error);
    }
  }

  async function getTripGuests() {
    try {
      const guests = await participantsServer.getByTripId(tripId);
      setGuests(guests);
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    getTripLinks();
    getTripGuests();
  }, []);

  return (
    <View className="flex-1 mt-10">
      <Text className="text-zinc-50 text-2xl font-semibold mb-2">
        Importants Links
      </Text>

      <View className="flex-1 ">
        {links.length > 0 ? (
          <FlatList
            data={links}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <TripLink data={item} />}
            contentContainerClassName="gap-4"
          />
        ) : (
          <Text className="text-zinc-400 font-regular text-base mt-2 mb-6">
            No links added.
          </Text>
        )}

        <Button variant="secondary" onPress={() => setShowNewLinkModal(true)}>
          <Plus color={colors.zinc[200]} size={20} />
          <Button.Title>Register new link</Button.Title>
        </Button>
      </View>

      <View className="flex-1 border-t border-zinc-800 mt-6">
        <Text className="text-zinc-50 text-2xl font-semibold my-6">Guests</Text>

        <FlatList
          data={guests}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Participant data={item} />}
          contentContainerClassName="gap-4 pb-44"
        />
      </View>

      <Modal
        title="Register Link"
        subtitle="All guests can view importants links"
        visible={showNewLinkModal}
        onClose={() => setShowNewLinkModal(false)}
      >
        <View className="gap-2 mb-3">
          <Input variant="secondary">
            <Input.Field
              placeholder="Link title"
              onChangeText={setLinkTitle}
              value={linkTitle}
            />
          </Input>

          <Input variant="secondary">
            <Input.Field
              placeholder="Link URL"
              onChangeText={setLinkURL}
              value={linkURL}
            />
          </Input>

          <Button isLoading={isCreatingLinkTrip} onPress={handleCreateTripLink}>
            <Button.Title>Save Link</Button.Title>
          </Button>
        </View>
      </Modal>
    </View>
  );
}
