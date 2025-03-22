import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/apiClient';
import RPGGroupDetailView from '../components/RPGGroupDetailView';
import Loader from '../components/Loader';

const RPGGroupDetailPage = () => {
    const { id } = useParams();
    const location = useLocation();

    const { data: group, isLoading, error } = useQuery({
        queryKey: ['group', id],
        queryFn: () => apiClient.getImageGroups().then(response => {
            const group = response.groups.find(g => g.images[0].id === parseInt(id));
            if (!group) {
                throw new Error('Group not found');
            }
            return group;
        }),
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader size="md" color="gray" showText={false} />
            </div>
        );
    }

    if (error || !group) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="text-xl text-gray-800 mb-4">グループが見つかりません</div>
                <button
                    className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
                    onClick={() => navigate(-1)}
                >
                    戻る
                </button>
            </div>
        );
    }

    return <RPGGroupDetailView group={group} location={location} />;
};

export default RPGGroupDetailPage; 